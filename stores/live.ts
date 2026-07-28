"use client";

import { create } from "zustand";
import { post } from "@/lib/api";
import type { LiveTokenResponse } from "@/lib/types";
import { useUi } from "./ui";
// livekit-client is imported dynamically inside connect() so it is never
// evaluated during SSR (it reaches for browser-only globals).
import type { Participant, RemoteTrack, Room } from "livekit-client";

/**
 * Live-listen engine (M27). Mirrors stores/player.ts: the non-serializable
 * LiveKit Room + audio element live in module-level vars; the store holds only
 * serializable state so it can drive the UI. Only one live channel plays at a
 * time (starting another disconnects the previous one).
 *
 * Listeners join as subscribers. A broadcaster can grant a listener permission
 * to speak (canPublish); when that happens LiveKit pushes the new permission
 * live and this store flips `canSpeak`, letting the listener open their mic and
 * be heard by everyone. "Raise hand" asks the broadcaster for that permission.
 */
interface LiveState {
  channelId: number | null;
  channelTitle: string | null;
  status: "idle" | "connecting" | "live" | "error";
  volume: number;
  muted: boolean;

  canSpeak: boolean; // broadcaster granted publish permission
  micOn: boolean; // the listener's mic is live
  handRaised: boolean; // a raise-hand request is pending

  connect: (channelId: number, title: string) => Promise<void>;
  disconnect: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setMic: (on: boolean) => Promise<void>;
  raiseHand: () => Promise<void>;
  lowerHand: () => Promise<void>;
}

let room: Room | null = null;
// One hidden <audio> element per subscribed remote track (the broadcaster and
// any invited speakers), so every voice is heard — not just the latest one.
const remoteAudio = new Map<string, HTMLAudioElement>();

function trackKey(track: RemoteTrack): string {
  return track.sid ?? "";
}

function attachRemote(track: RemoteTrack, muted: boolean, volume: number) {
  const el = track.attach() as HTMLAudioElement;
  el.autoplay = true;
  el.muted = muted;
  el.volume = volume;
  el.style.display = "none";
  document.body.appendChild(el);
  void el.play().catch(() => undefined);
  remoteAudio.set(trackKey(track), el);
}

function detachRemote(track: RemoteTrack) {
  const key = trackKey(track);
  const el = remoteAudio.get(key);
  if (!el) return;
  try {
    track.detach(el);
  } catch {
    /* noop */
  }
  el.remove();
  remoteAudio.delete(key);
}

function clearRemotes() {
  remoteAudio.forEach((el) => {
    try {
      el.pause();
      el.srcObject = null;
    } catch {
      /* noop */
    }
    el.remove();
  });
  remoteAudio.clear();
}

export const useLive = create<LiveState>((set, get) => ({
  channelId: null,
  channelTitle: null,
  status: "idle",
  volume: 0.9,
  muted: false,
  canSpeak: false,
  micOn: false,
  handRaised: false,

  connect: async (channelId, title) => {
    // Tear down any current live connection first.
    if (room) {
      try {
        room.disconnect();
      } catch {
        /* noop */
      }
      room = null;
    }

    set({ channelId, channelTitle: title, status: "connecting", canSpeak: false, micOn: false, handRaised: false });

    try {
      const creds = await post<LiveTokenResponse>(`/live-channels/${channelId}/token`);

      const { Room, RoomEvent } = await import("livekit-client");

      const r = new Room();
      room = r;

      // Play each subscribed audio track (broadcaster + invited speakers) on its
      // own element so they mix rather than replace one another.
      r.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === "audio") attachRemote(track, get().muted, get().volume);
      });
      r.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        if (track.kind === "audio") detachRemote(track);
      });

      // The broadcaster granted/revoked our permission to speak. LiveKit pushes
      // this live (no reconnect), so reflect it in the UI immediately.
      r.on(RoomEvent.ParticipantPermissionsChanged, (_prev: unknown, participant: Participant) => {
        if (participant !== r.localParticipant) return;
        const can = !!r.localParticipant.permissions?.canPublish;
        if (can) {
          set({ canSpeak: true, handRaised: false });
          useUi.getState().toast("You've been invited to speak — tap the mic to talk.", "success");
        } else {
          if (get().micOn) {
            void r.localParticipant.setMicrophoneEnabled(false).catch(() => undefined);
          }
          set({ canSpeak: false, micOn: false, handRaised: false });
          useUi.getState().toast("Your speaking access ended.", "info");
        }
      });

      r.on(RoomEvent.Disconnected, () => {
        clearRemotes();
        if (get().channelId === channelId) {
          set({ status: "idle", channelId: null, channelTitle: null, canSpeak: false, micOn: false, handRaised: false });
        }
      });

      // Browser-facing signalling URL — configured per deployment via
      // NEXT_PUBLIC_LIVEKIT_URL (e.g. ws://<LAN-IP>:7880 or wss://live.domain).
      // Falls back to whatever the API returned if the env is not set.
      const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || creds.ws_url;
      await r.connect(wsUrl, creds.token);
      // Seed speak permission in case it was already granted at/just before join.
      set({ status: "live", canSpeak: !!r.localParticipant.permissions?.canPublish });
    } catch (e) {
      console.error("Live connect failed", e);
      set({ status: "error", channelId: null, channelTitle: null, canSpeak: false, micOn: false, handRaised: false });
      useUi.getState().toast("Could not connect to the live broadcast.", "error");
      if (room) {
        try {
          room.disconnect();
        } catch {
          /* noop */
        }
        room = null;
      }
    }
  },

  disconnect: () => {
    if (room) {
      try {
        room.disconnect();
      } catch {
        /* noop */
      }
      room = null;
    }
    clearRemotes();
    set({ status: "idle", channelId: null, channelTitle: null, canSpeak: false, micOn: false, handRaised: false });
  },

  setVolume: (v) => {
    const vol = Math.max(0, Math.min(1, v));
    remoteAudio.forEach((el) => {
      el.volume = vol;
      el.muted = false;
    });
    set({ volume: vol, muted: false });
  },

  toggleMute: () => {
    const muted = !get().muted;
    remoteAudio.forEach((el) => {
      el.muted = muted;
    });
    set({ muted });
  },

  // Open or close the listener's own microphone (only once granted).
  setMic: async (on) => {
    if (!room) return;
    if (on && !get().canSpeak) return;
    try {
      await room.localParticipant.setMicrophoneEnabled(on);
      set({ micOn: on });
    } catch (e) {
      console.error("Mic toggle failed", e);
      useUi.getState().toast("Could not access your microphone.", "error");
      set({ micOn: false });
    }
  },

  // Ask the broadcaster for permission to speak.
  raiseHand: async () => {
    const { channelId } = get();
    if (!room || channelId == null) return;
    const lp = room.localParticipant;
    try {
      await post(`/live-channels/${channelId}/raise-hand`, { identity: lp.identity, name: lp.name ?? "Listener" });
      set({ handRaised: true });
      useUi.getState().toast("Hand raised — waiting for the host to let you speak.", "success");
    } catch {
      useUi.getState().toast("Could not send your request. Try again.", "error");
    }
  },

  // Withdraw a pending raise-hand request.
  lowerHand: async () => {
    const { channelId } = get();
    set({ handRaised: false });
    if (!room || channelId == null) return;
    const lp = room.localParticipant;
    void post(`/live-channels/${channelId}/lower-hand`, { identity: lp.identity }).catch(() => undefined);
  },
}));
