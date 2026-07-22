"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, post, put } from "@/lib/api";
import { anonymousId } from "@/lib/anon";
import type { AdDescriptor, PlayEventType, StreamResponse } from "@/lib/types";
import { currentEntitlements, useAuth } from "./auth";
import { useUi } from "./ui";

/** A resolved, playable entry in the queue. */
export interface PlayerTrack {
  key: string;               // stable identity: `${type}:${id}`
  type: "song" | "audio_asset" | "podcast_episode" | "episode" | "story";
  id: number;                // catalogue id (song id, episode id, …)
  assetId: number;           // the streamable audio_assets.id
  title: string;
  titleBn: string | null;
  subtitle: string;          // artists / programme / channel
  artworkUrl: string | null;
  duration: number | null;
  isPremium: boolean;
  href: string;              // detail page
  startAt?: number;          // stories: offset into the parent episode audio
}

interface PlayerState {
  queue: PlayerTrack[];
  index: number;
  contextLabel: string | null;   // where the queue came from, e.g. album title

  status: "idle" | "loading" | "playing" | "paused" | "blocked";
  position: number;
  duration: number;
  volume: number;
  muted: boolean;
  repeat: "off" | "all" | "one";
  shuffle: boolean;

  stream: StreamResponse | null; // descriptor for the current track
  ad: AdDescriptor | null;       // non-null while a pre-roll ad is playing
  adRemaining: number;

  // actions
  playContext: (tracks: PlayerTrack[], startIndex: number, label?: string, resumeFrom?: number) => void;
  playTrack: (track: PlayerTrack, resumeFrom?: number) => void;
  toggle: () => void;
  next: (userInitiated?: boolean) => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  queueNext: (track: PlayerTrack) => void;
  queueLast: (track: PlayerTrack) => void;
  removeAt: (i: number) => void;
  jumpTo: (i: number) => void;
  clearQueue: () => void;
}

// ---------------------------------------------------------------------------
// Module-level audio engine (client only)
// ---------------------------------------------------------------------------

let audio: HTMLAudioElement | null = null;
let pendingSeek: number | null = null;
let lastProgressAt = 0;
let skipTimestamps: number[] = [];
let queueSyncTimer: ReturnType<typeof setTimeout> | null = null;

function engine(): HTMLAudioElement {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = "auto";
  if (typeof window !== "undefined") {
    (window as unknown as { __betarAudio?: HTMLAudioElement }).__betarAudio = audio;
  }

  audio.addEventListener("timeupdate", () => {
    const s = usePlayer.getState();
    const pos = audio!.currentTime;

    if (s.ad) {
      usePlayer.setState({ adRemaining: Math.max(0, Math.ceil((audio!.duration || s.ad.duration_seconds) - pos)) });
      return;
    }

    usePlayer.setState({ position: pos });

    // Preview cap for premium content on the free tier.
    const stream = s.stream?.stream;
    if (stream?.is_preview && pos >= stream.duration_seconds) {
      audio!.pause();
      usePlayer.setState({ status: "blocked" });
      sendEvent("complete", stream.duration_seconds);
      if (useAuth.getState().token) useUi.getState().openUpgradePrompt();
      else useUi.getState().openLoginPrompt("Sign in to keep listening — premium content plays a preview for guests.");
      return;
    }

    // Server-side progress every 10s keeps Continue Listening in sync.
    if (pos - lastProgressAt >= 10 || pos < lastProgressAt) {
      lastProgressAt = pos;
      sendEvent("progress", pos);
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    const s = usePlayer.getState();
    if (s.ad) return;
    if (pendingSeek != null) {
      audio!.currentTime = pendingSeek;
      pendingSeek = null;
    }
    usePlayer.setState({ duration: audio!.duration || s.stream?.stream.duration_seconds || 0 });
  });

  audio.addEventListener("ended", () => {
    const s = usePlayer.getState();
    if (s.ad) {
      finishAd(true);
      return;
    }
    sendEvent("complete", audio!.duration || s.position);
    if (s.repeat === "one") {
      audio!.currentTime = s.queue[s.index]?.startAt ?? 0;
      void audio!.play();
      sendEvent("replay", 0);
      return;
    }
    s.next(false);
  });

  audio.addEventListener("error", () => {
    const s = usePlayer.getState();
    if (s.status === "loading" || s.status === "playing") {
      useUi.getState().toast("Playback failed for this item.", "error");
      usePlayer.setState({ status: "paused" });
    }
  });

  return audio;
}

function sendEvent(type: PlayEventType, position: number) {
  const s = usePlayer.getState();
  const track = s.queue[s.index];
  if (!track) return;
  const authed = !!useAuth.getState().token;
  void post(`/assets/${track.assetId}/events`, {
    event_type: type,
    position_seconds: Math.max(0, Math.floor(position)),
    platform: "web",
    ...(authed ? {} : { anonymous_id: anonymousId() }),
  }).catch(() => undefined);
}

function finishAd(completed: boolean) {
  const s = usePlayer.getState();
  const ad = s.ad;
  if (!ad) return;
  const authed = !!useAuth.getState().token;
  void post("/ads/impression", {
    ad_asset_id: ad.id,
    slot: ad.slot,
    platform: "web",
    completed,
    ...(authed ? {} : { anonymous_id: anonymousId() }),
  }).catch(() => undefined);

  usePlayer.setState({ ad: null, adRemaining: 0 });
  startMainStream();
}

/** Point the engine at the resolved main stream and play. */
function startMainStream() {
  const s = usePlayer.getState();
  const track = s.queue[s.index];
  const stream = s.stream;
  if (!track || !stream) return;

  const el = engine();
  el.src = stream.stream.url;
  if (track.startAt) pendingSeek = track.startAt;
  lastProgressAt = 0;
  el.play()
    .then(() => {
      usePlayer.setState({ status: "playing", duration: stream.stream.duration_seconds });
      sendEvent("play", pendingSeek ?? 0);
      updateMediaSession(track);
    })
    .catch(() => usePlayer.setState({ status: "paused" }));
}

async function loadCurrent(resumeFrom?: number) {
  const s = usePlayer.getState();
  const track = s.queue[s.index];
  if (!track) return;

  usePlayer.setState({ status: "loading", position: resumeFrom ?? 0, duration: track.duration ?? 0, stream: null, ad: null });

  try {
    const stream = await get<StreamResponse>(`/assets/${track.assetId}/stream`);
    // The user may have skipped while we were resolving.
    if (usePlayer.getState().queue[usePlayer.getState().index]?.key !== track.key) return;

    pendingSeek = resumeFrom ?? track.startAt ?? null;
    usePlayer.setState({ stream });

    if (stream.ad?.audio_url) {
      // Pre-roll ad for the free tier: play the creative, then the track.
      usePlayer.setState({ ad: stream.ad, adRemaining: stream.ad.duration_seconds, status: "playing" });
      const el = engine();
      el.src = stream.ad.audio_url;
      el.play().catch(() => finishAd(false));
    } else {
      startMainStream();
    }
  } catch (e) {
    const status = (e as { status?: number }).status;
    useUi.getState().toast(
      status === 404 ? "This item is not available for streaming." : "Could not start playback.",
      "error",
    );
    usePlayer.setState({ status: "idle", stream: null });
  }
}

function updateMediaSession(track: PlayerTrack) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.subtitle,
    album: "Bangladesh Betar Archive",
  });
  navigator.mediaSession.setActionHandler("play", () => usePlayer.getState().toggle());
  navigator.mediaSession.setActionHandler("pause", () => usePlayer.getState().toggle());
  navigator.mediaSession.setActionHandler("nexttrack", () => usePlayer.getState().next(true));
  navigator.mediaSession.setActionHandler("previoustrack", () => usePlayer.getState().prev());
}

/** Free-tier skip limiter (skips_per_hour entitlement). */
function consumeSkip(): boolean {
  const ent = currentEntitlements();
  if (ent.is_premium || ent.skips_per_hour == null) return true;
  const now = Date.now();
  skipTimestamps = skipTimestamps.filter((t) => now - t < 3_600_000);
  if (skipTimestamps.length >= ent.skips_per_hour) {
    useUi.getState().toast(`Free listening allows ${ent.skips_per_hour} skips per hour. Go Premium for unlimited skips.`, "premium");
    return false;
  }
  skipTimestamps.push(now);
  return true;
}

function syncQueueToServer() {
  if (!useAuth.getState().token) return;
  if (queueSyncTimer) clearTimeout(queueSyncTimer);
  queueSyncTimer = setTimeout(() => {
    const s = usePlayer.getState();
    void put("/me/queue", {
      items: s.queue.map((t) => ({ type: t.type, id: t.id })),
      repeat_mode: s.repeat,
      shuffle: s.shuffle,
    }).catch(() => undefined);
  }, 2000);
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePlayer = create<PlayerState>()(
  persist(
    (set, getState) => ({
      queue: [],
      index: -1,
      contextLabel: null,
      status: "idle",
      position: 0,
      duration: 0,
      volume: 0.9,
      muted: false,
      repeat: "off",
      shuffle: false,
      stream: null,
      ad: null,
      adRemaining: 0,

      playContext: (tracks, startIndex, label, resumeFrom) => {
        if (!tracks.length) return;
        const s = getState();
        let queue = tracks;
        let index = startIndex;
        if (s.shuffle) {
          const chosen = tracks[startIndex];
          queue = [chosen, ...shuffled(tracks.filter((_, i) => i !== startIndex))];
          index = 0;
        }
        set({ queue, index, contextLabel: label ?? null });
        engine().volume = s.muted ? 0 : s.volume;
        void loadCurrent(resumeFrom);
        syncQueueToServer();
      },

      playTrack: (track, resumeFrom) => {
        getState().playContext([track], 0, undefined, resumeFrom);
      },

      toggle: () => {
        const s = getState();
        const el = engine();
        if (s.status === "playing") {
          el.pause();
          set({ status: "paused" });
          if (!s.ad) sendEvent("pause", el.currentTime);
        } else if (s.status === "paused" || s.status === "blocked") {
          el.play()
            .then(() => {
              set({ status: "playing" });
              if (!s.ad) sendEvent("play", el.currentTime);
            })
            .catch(() => undefined);
        } else if (s.status === "idle" && s.queue[s.index]) {
          void loadCurrent(s.position > 5 ? s.position : undefined);
        }
      },

      next: (userInitiated = false) => {
        const s = getState();
        if (s.ad) return; // ads are not skippable
        if (!s.queue.length) return;
        if (userInitiated) {
          if (!consumeSkip()) return;
          sendEvent("skip", engine().currentTime);
        }
        let i = s.index + 1;
        if (i >= s.queue.length) {
          if (s.repeat === "all") i = 0;
          else {
            set({ status: "paused", position: 0 });
            return;
          }
        }
        set({ index: i });
        void loadCurrent();
      },

      prev: () => {
        const s = getState();
        if (s.ad) return;
        const el = engine();
        // Spotify behaviour: restart unless within the first 3 seconds.
        if (el.currentTime > 3 || s.index <= 0) {
          el.currentTime = s.queue[s.index]?.startAt ?? 0;
          sendEvent("seek", 0);
          return;
        }
        set({ index: s.index - 1 });
        void loadCurrent();
      },

      seek: (seconds) => {
        const s = getState();
        if (s.ad) return;
        const el = engine();
        el.currentTime = seconds;
        set({ position: seconds });
        sendEvent("seek", seconds);
      },

      setVolume: (v) => {
        engine().volume = v;
        set({ volume: v, muted: v === 0 });
      },

      toggleMute: () => {
        const s = getState();
        const muted = !s.muted;
        engine().volume = muted ? 0 : s.volume || 0.6;
        set({ muted });
      },

      cycleRepeat: () => {
        const order: PlayerState["repeat"][] = ["off", "all", "one"];
        const s = getState();
        set({ repeat: order[(order.indexOf(s.repeat) + 1) % 3] });
        syncQueueToServer();
      },

      toggleShuffle: () => {
        const s = getState();
        if (!s.shuffle && s.queue.length > 1) {
          const current = s.queue[s.index];
          const rest = shuffled(s.queue.filter((_, i) => i !== s.index));
          set({ shuffle: true, queue: current ? [current, ...rest] : rest, index: current ? 0 : -1 });
        } else {
          set({ shuffle: !s.shuffle });
        }
        syncQueueToServer();
      },

      queueNext: (track) => {
        const s = getState();
        if (s.index < 0) {
          getState().playTrack(track);
          return;
        }
        const queue = [...s.queue];
        queue.splice(s.index + 1, 0, track);
        set({ queue });
        useUi.getState().toast("Will play next.", "success");
        syncQueueToServer();
      },

      queueLast: (track) => {
        const s = getState();
        if (s.index < 0) {
          getState().playTrack(track);
          return;
        }
        set({ queue: [...s.queue, track] });
        useUi.getState().toast("Added to queue.", "success");
        syncQueueToServer();
      },

      removeAt: (i) => {
        const s = getState();
        if (i === s.index) return; // never remove the playing item here
        const queue = s.queue.filter((_, idx) => idx !== i);
        set({ queue, index: i < s.index ? s.index - 1 : s.index });
        syncQueueToServer();
      },

      jumpTo: (i) => {
        const s = getState();
        if (!s.queue[i]) return;
        if (i !== s.index && !consumeSkip()) return;
        set({ index: i });
        void loadCurrent();
      },

      clearQueue: () => {
        const s = getState();
        const current = s.queue[s.index];
        set({ queue: current ? [current] : [], index: current ? 0 : -1 });
        syncQueueToServer();
      },
    }),
    {
      name: "betar.player",
      partialize: (s) => ({
        queue: s.queue,
        index: s.index,
        contextLabel: s.contextLabel,
        volume: s.volume,
        muted: s.muted,
        repeat: s.repeat,
        shuffle: s.shuffle,
      }),
    },
  ),
);

/** Convenience selector: the currently loaded track, if any. */
export function useCurrentTrack(): PlayerTrack | null {
  return usePlayer((s) => s.queue[s.index] ?? null);
}
