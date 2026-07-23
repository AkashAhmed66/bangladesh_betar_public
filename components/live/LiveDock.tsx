"use client";

import { Loader2, RadioTower, Volume2, VolumeX, X } from "lucide-react";
import Link from "next/link";
import { useLive } from "@/stores/live";

/**
 * Persistent bar shown while a live broadcast is connected, so audio keeps
 * playing as the listener navigates. Sits above the on-demand PlayerBar and is
 * fully independent of it (a separate audio engine — stores/live.ts).
 */
export default function LiveDock() {
  const status = useLive((s) => s.status);
  const channelId = useLive((s) => s.channelId);
  const title = useLive((s) => s.channelTitle);
  const volume = useLive((s) => s.volume);
  const muted = useLive((s) => s.muted);
  const setVolume = useLive((s) => s.setVolume);
  const toggleMute = useLive((s) => s.toggleMute);
  const disconnect = useLive((s) => s.disconnect);

  if (status !== "live" && status !== "connecting") return null;

  return (
    <div className="flex items-center gap-3 border-t border-flag/30 bg-flag/10 px-3 py-2 backdrop-blur sm:px-4">
      <Link
        href={channelId ? `/live/${channelId}` : "/live"}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-card bg-flag/20 text-flag">
          <RadioTower className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-flag">
            {status === "connecting" ? (
              <>
                <Loader2 className="size-3 animate-spin" /> Connecting
              </>
            ) : (
              <>
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-flag opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-flag" />
                </span>
                Live
              </>
            )}
          </span>
          <span className="clamp-1 text-sm font-semibold text-ink">{title ?? "Live radio"}</span>
        </span>
      </Link>

      {/* Volume (hidden on the smallest screens) */}
      <div className="hidden items-center gap-2 sm:flex">
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="text-ink-soft transition hover:text-ink"
        >
          {muted || volume === 0 ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Live volume"
          className="h-1 w-24 cursor-pointer accent-flag"
        />
      </div>

      <button
        onClick={disconnect}
        className="inline-flex items-center gap-1.5 rounded-full bg-flag px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
      >
        <X className="size-4" /> Stop
      </button>
    </div>
  );
}
