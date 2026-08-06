"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, post, put } from "@/lib/api";
import { anonymousId } from "@/lib/anon";
import { attachAudioSource } from "@/lib/hls";
import { offlineSource } from "@/lib/offline";
import { attachOfflineHls } from "@/lib/offlinePlayback";
import { toTracks } from "@/lib/tracks";
import type { AdDescriptor, AudioAsset, PlayEventType, StreamResponse } from "@/lib/types";
import { currentEntitlements, useAuth } from "./auth";
import { useUi } from "./ui";

/** A resolved, playable entry in the queue. */
export interface PlayerTrack {
  key: string;               // stable identity: `${type}:${id}`
  type: "song" | "audio_asset" | "podcast_episode" | "episode";
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
  moveInQueue: (from: number, to: number) => void;
}

// ---------------------------------------------------------------------------
// Module-level audio engine (client only)
// ---------------------------------------------------------------------------

/** Every ad is played for exactly this many seconds — no more, no less. */
const AD_DURATION_SECONDS = 10;

let audio: HTMLAudioElement | null = null;
let pendingSeek: number | null = null;
let currentBlobUrl: string | null = null; // object URL of the offline track currently loaded
let lastProgressAt = 0;
let skipTimestamps: number[] = [];
let queueSyncTimer: ReturnType<typeof setTimeout> | null = null;
let adTimer: ReturnType<typeof setInterval> | null = null;

// Ad pacing: play one ad after every `adEveryN` songs (server-configurable via
// the `ad_every_n_songs` setting). We count ad-free songs and only ask the
// server for an ad — `?ad=1` — once that many have played, so the round-robin
// pointer only advances when an ad is actually shown.
let songsSinceAd = 0;
let adEveryN = 2;

// ---------------------------------------------------------------------------
// Free-tier daily "pick" budget
// ---------------------------------------------------------------------------
// A "pick" is a deliberate selection by a free/guest listener: pressing play on
// a track/album/playlist, or adding a track to the queue. Premium is unlimited.
// The limit is admin-configurable (setting `free_daily_picks`) and arrives from
// the server on every stream response (and via entitlements for members). Once
// the budget is spent, curation is blocked and autoplay drops into a random
// "radio" mix. Counting is per calendar day, persisted so a reload can't reset
// it — consistent with how the skip-limit / seek-gate are enforced client-side.

const PICKS_STORAGE_KEY = "betar.picks";
let serverPickLimit = 10; // synced from stream.daily_picks (0 = unlimited)

function pickDayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readPicksUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = JSON.parse(localStorage.getItem(PICKS_STORAGE_KEY) || "null");
    if (raw && raw.day === pickDayKey()) return Number(raw.used) || 0;
  } catch {
    /* ignore malformed storage */
  }
  return 0;
}

function writePicksUsed(used: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PICKS_STORAGE_KEY, JSON.stringify({ day: pickDayKey(), used }));
  } catch {
    /* storage may be unavailable — enforcement is best-effort */
  }
}

/** Effective daily pick limit for the current listener (0 = unlimited). */
function pickLimit(): number {
  const ent = currentEntitlements();
  if (ent.is_premium) return 0; // premium is never gated
  if (typeof ent.daily_picks === "number") return Math.max(0, ent.daily_picks);
  return Math.max(0, serverPickLimit);
}

/** True once a free listener has spent their daily picks (→ radio mode). */
function pickBudgetSpent(): boolean {
  const limit = pickLimit();
  if (limit <= 0) return false;
  return readPicksUsed() >= limit;
}

/** Consume one pick. Returns false (without consuming) when the budget is spent. */
function consumePick(): boolean {
  const limit = pickLimit();
  if (limit <= 0) return true;
  const used = readPicksUsed();
  if (used >= limit) return false;
  writePicksUsed(used + 1);
  return true;
}

function promptPicksSpent() {
  const limit = pickLimit();
  useUi.getState().openUpgradePrompt({
    title: "You've used today's free picks",
    body: `Free listening includes ${limit} hand-picked plays a day, and you've used them all. Music keeps going as a random radio mix — go Premium for unlimited picks and a queue you fully control.`,
  });
}

/** Fetch a random, non-premium track to keep free-tier autoplay going. */
async function fetchRadioTrack(excludeAssetId?: number): Promise<PlayerTrack | null> {
  try {
    const qs = excludeAssetId ? `?exclude=${excludeAssetId}` : "";
    const res = await get<{ data: AudioAsset[] }>(`/radio${qs}`);
    const tracks = toTracks(res.data);
    if (!tracks.length) return null;
    return tracks[Math.floor(Math.random() * tracks.length)];
  } catch {
    return null;
  }
}

/**
 * Drop into "radio": play a random track. When `replace` is true the queue is
 * reset to that single track (a free listener with no picks left starting
 * fresh); otherwise it is appended and made current — used by auto-advance once
 * the budget is spent, so autoplay ignores the built queue and just keeps
 * playing random music.
 */
function enterRadio(replace: boolean) {
  const s = usePlayer.getState();
  const currentAsset = s.queue[s.index]?.assetId;
  void fetchRadioTrack(currentAsset).then((track) => {
    if (!track) {
      usePlayer.setState({ status: "paused" });
      return;
    }
    const cur = usePlayer.getState();
    if (replace || cur.index < 0) {
      usePlayer.setState({ queue: [track], index: 0, contextLabel: "Radio mix" });
    } else {
      usePlayer.setState({ queue: [...cur.queue, track], index: cur.queue.length, contextLabel: "Radio mix" });
    }
    void loadCurrent();
  });
}

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
      // The ad countdown + hand-off are driven by a fixed timer (see startAd),
      // not the creative's own length, so every ad runs exactly AD_DURATION_SECONDS.
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
      // Ignore a creative that ends early — the fixed ad timer decides when the
      // ad finishes, so it always occupies the full AD_DURATION_SECONDS.
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

function clearAdTimer() {
  if (adTimer) {
    clearInterval(adTimer);
    adTimer = null;
  }
}

/**
 * Play a pre-roll ad for EXACTLY AD_DURATION_SECONDS. A fixed wall-clock timer
 * — not the creative's own duration — drives the countdown and the hand-off to
 * the main track, so the ad is never shorter or longer than the mandated length
 * (a longer creative is cut off; the slot always lasts the full duration).
 */
function startAd(ad: AdDescriptor) {
  clearAdTimer();
  const el = engine();
  usePlayer.setState({ ad, adRemaining: AD_DURATION_SECONDS, status: "playing" });
  void attachAudioSource(el, ad.audio_url)
    .then(() => el.play())
    .catch(() => finishAd(false));

  const startedAt = Date.now();
  adTimer = setInterval(() => {
    const elapsed = (Date.now() - startedAt) / 1000;
    usePlayer.setState({ adRemaining: Math.max(0, Math.ceil(AD_DURATION_SECONDS - elapsed)) });
    if (elapsed >= AD_DURATION_SECONDS) {
      finishAd(true); // clears the timer and starts the main stream
    }
  }, 250);
}

function finishAd(completed: boolean) {
  clearAdTimer();
  const s = usePlayer.getState();
  const ad = s.ad;
  if (!ad) return;
  const authed = !!useAuth.getState().token;
  void post("/ads/impression", {
    ad_campaign_id: ad.id,
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
  if (track.startAt) pendingSeek = track.startAt;
  lastProgressAt = 0;
  // Full streams arrive as encrypted HLS playlists (download protection);
  // previews and fallbacks are plain URLs — attachAudioSource handles both.
  attachAudioSource(el, stream.stream.url)
    .then(() => el.play())
    .then(() => {
      usePlayer.setState({ status: "playing", duration: stream.stream.duration_seconds });
      sendEvent("play", pendingSeek ?? 0);
      updateMediaSession(track);
    })
    .catch(() => usePlayer.setState({ status: "paused" }));
}

async function loadCurrent(resumeFrom?: number) {
  clearAdTimer(); // never let a previous ad's timer bleed into a new load
  const s = usePlayer.getState();
  const track = s.queue[s.index];
  if (!track) return;

  usePlayer.setState({ status: "loading", position: resumeFrom ?? 0, duration: track.duration ?? 0, stream: null, ad: null });

  // Release the previous offline object URL, if any.
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }

  // Offline-first: if this track was saved, play the local copy. Works with
  // no network and never carries an ad (offline is a Premium-only feature).
  // v2 saves are encrypted-HLS packages decrypted in memory at play time;
  // legacy v1 saves are plain blobs and stay playable.
  const offline = await offlineSource(track.assetId);
  if (offline) {
    // Bail if the user skipped while we were reading storage.
    if (usePlayer.getState().queue[usePlayer.getState().index]?.key !== track.key) {
      if (offline.kind === "blob") URL.revokeObjectURL(offline.url);
      return;
    }
    const el = engine();
    pendingSeek = resumeFrom ?? track.startAt ?? null;
    lastProgressAt = 0;
    usePlayer.setState({ stream: null, ad: null });
    const attach =
      offline.kind === "blob"
        ? ((currentBlobUrl = offline.url), attachAudioSource(el, offline.url))
        : attachOfflineHls(el, track.assetId);
    attach
      .then(() => el.play())
      .then(() => {
        usePlayer.setState({ status: "playing", duration: el.duration || track.duration || 0 });
        sendEvent("play", pendingSeek ?? 0);
        updateMediaSession(track);
      })
      .catch(() => usePlayer.setState({ status: "paused" }));
    return;
  }

  try {
    // Ask for an ad only once `adEveryN` ad-free songs have played (free tier).
    const adsEnabled = currentEntitlements().ads_enabled;
    const wantAd = adsEnabled && songsSinceAd >= adEveryN;
    const stream = await get<StreamResponse>(`/assets/${track.assetId}/stream${wantAd ? "?ad=1" : ""}`);
    // The user may have skipped while we were resolving.
    if (usePlayer.getState().queue[usePlayer.getState().index]?.key !== track.key) return;

    if (typeof stream.ad_every_n_songs === "number" && stream.ad_every_n_songs > 0) {
      adEveryN = stream.ad_every_n_songs; // keep in sync with the admin setting
    }
    if (typeof stream.daily_picks === "number") {
      serverPickLimit = stream.daily_picks; // keep the pick budget in sync (guests included)
    }

    pendingSeek = resumeFrom ?? track.startAt ?? null;
    usePlayer.setState({ stream });

    if (stream.ad?.audio_url) {
      songsSinceAd = 0; // ad served — restart the count toward the next one
      startAd(stream.ad); // fixed-length pre-roll, then the main track
    } else {
      if (adsEnabled) songsSinceAd += 1; // one more ad-free song
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

/**
 * Playback is members-only: a listener must be signed in before any audio can
 * start. Returns true when there is a session; otherwise opens the login prompt
 * and returns false so the caller can abort. Pausing an already-playing track
 * is never gated (only starting/resuming is).
 */
function requireAuth(): boolean {
  if (useAuth.getState().token) return true;
  useUi.getState().openLoginPrompt(
    "Please sign in to play. Listening on Bangladesh Betar is free — create an account to start playing.",
  );
  return false;
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
        // Gate: only signed-in listeners can start playback.
        if (!requireAuth()) return;
        // Free-tier daily pick budget: choosing new content costs one pick. When
        // the budget is spent we deny the specific choice; if nothing is playing
        // we start a radio mix so the listener still gets music.
        if (!consumePick()) {
          promptPicksSpent();
          const cur = getState();
          if (cur.index < 0 || cur.status === "idle") enterRadio(true);
          return;
        }
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
        // Starting or resuming requires a session (a guest can only reach a
        // resumable state via a queue persisted from a previous sign-in).
        // Pausing while playing is always allowed.
        if (s.status !== "playing" && !requireAuth()) return;
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
        // Once a free listener's daily picks are spent, autoplay becomes a
        // random radio mix — the next track is random, irrespective of the queue.
        const radio = pickBudgetSpent();
        if (!radio && !s.queue.length) return;
        if (userInitiated) {
          if (!consumeSkip()) return;
          sendEvent("skip", engine().currentTime);
        }
        if (radio) {
          enterRadio(false);
          return;
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
        // Scrubbing to a position is Premium-only. Free/guest listeners can
        // still play, pause and skip, but not drag the timeline (FR-PLY).
        if (!currentEntitlements().is_premium) {
          useUi.getState().openUpgradePrompt({
            title: "Seeking is a Premium feature",
            body: "Upgrade to scrub to any moment in a recording. Free listening plays each track straight through.",
          });
          return;
        }
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
          getState().playTrack(track); // playContext charges the pick
          return;
        }
        if (!consumePick()) {
          promptPicksSpent();
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
          getState().playTrack(track); // playContext charges the pick
          return;
        }
        if (!consumePick()) {
          promptPicksSpent();
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

      moveInQueue: (from, to) => {
        const s = getState();
        // Only reorder within "up next" (never the currently-playing item),
        // so the active index is unaffected.
        if (from === to || from <= s.index || to <= s.index) return;
        if (!s.queue[from] || to < 0 || to >= s.queue.length) return;
        const queue = [...s.queue];
        const [moved] = queue.splice(from, 1);
        queue.splice(to, 0, moved);
        set({ queue });
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
