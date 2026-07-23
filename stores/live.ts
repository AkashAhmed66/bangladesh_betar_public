"use client";

import { create } from "zustand";
import { post } from "@/lib/api";
import type { LiveTokenResponse } from "@/lib/types";
import { useUi } from "./ui";
// livekit-client is imported dynamically inside connect() so it is never
// evaluated during SSR (it reaches for browser-only globals).
import type { RemoteTrack, Room } from "livekit-client";

/**
 * Live-listen engine (M27). Mirrors stores/player.ts: the non-serializable
 * LiveKit Room + audio element live in module-level vars; the store holds only
 * serializable state so it can drive the UI. Only one live channel plays at a
 * time (starting another disconnects the previous one).
 */
interface LiveState {
  channelId: number | null;
  channelTitle: string | null;
  status: "idle" | "connecting" | "live" | "error";
  volume: number;
  muted: boolean;

  connect: (channelId: number, title: string) => Promise<void>;
  disconnect: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
}

let room: Room | null = null;
let audioEl: HTMLAudioElement | null = null;

function ensureAudio(): HTMLAudioElement {
  if (audioEl) return audioEl;
  audioEl = new Audio();
  audioEl.autoplay = true;
  return audioEl;
}

export const useLive = create<LiveState>((set, get) => ({
  channelId: null,
  channelTitle: null,
  status: "idle",
  volume: 0.9,
  muted: false,

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

    set({ channelId, channelTitle: title, status: "connecting" });

    try {
      const creds = await post<LiveTokenResponse>(`/live-channels/${channelId}/token`);

      const { Room, RoomEvent } = await import("livekit-client");

      const r = new Room();
      room = r;

      const el = ensureAudio();
      el.muted = get().muted;
      el.volume = get().volume;

      r.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === "audio") {
          track.attach(el);
          el.play().catch(() => {
            /* autoplay guard — the Listen click already granted a gesture */
          });
        }
      });

      r.on(RoomEvent.Disconnected, () => {
        if (get().channelId === channelId) {
          set({ status: "idle", channelId: null, channelTitle: null });
        }
      });

      // Browser-facing signalling URL — configured per deployment via
      // NEXT_PUBLIC_LIVEKIT_URL (e.g. ws://<LAN-IP>:7880 or wss://live.domain).
      // Falls back to whatever the API returned if the env is not set.
      const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || creds.ws_url;
      await r.connect(wsUrl, creds.token);
      set({ status: "live" });
    } catch (e) {
      console.error("Live connect failed", e);
      set({ status: "error", channelId: null, channelTitle: null });
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
    if (audioEl) {
      try {
        audioEl.pause();
        audioEl.srcObject = null;
      } catch {
        /* noop */
      }
    }
    set({ status: "idle", channelId: null, channelTitle: null });
  },

  setVolume: (v) => {
    const vol = Math.max(0, Math.min(1, v));
    if (audioEl) {
      audioEl.volume = vol;
      audioEl.muted = false;
    }
    set({ volume: vol, muted: false });
  },

  toggleMute: () => {
    const muted = !get().muted;
    if (audioEl) audioEl.muted = muted;
    set({ muted });
  },
}));
