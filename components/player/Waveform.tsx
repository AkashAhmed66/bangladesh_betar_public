"use client";

import { useMemo } from "react";

interface WaveformProps {
  peaks: number[] | null | undefined;
  progress: number;      // 0..1
  onSeek?: (fraction: number) => void;
  className?: string;
  bars?: number;
}

/** Interactive waveform seek bar rendered from archive-computed peaks. */
export default function Waveform({ peaks, progress, onSeek, className = "", bars = 72 }: WaveformProps) {
  const normalized = useMemo(() => {
    if (!peaks?.length) {
      // Deterministic gentle wave when the asset has no computed peaks.
      return Array.from({ length: bars }, (_, i) => 0.35 + 0.3 * Math.abs(Math.sin(i * 0.7)) + 0.2 * Math.abs(Math.sin(i * 0.23)));
    }
    const step = peaks.length / bars;
    const out: number[] = [];
    for (let i = 0; i < bars; i++) {
      const slice = peaks.slice(Math.floor(i * step), Math.max(Math.floor((i + 1) * step), Math.floor(i * step) + 1));
      const max = Math.max(...slice.map(Math.abs), 0.05);
      out.push(Math.min(1, max));
    }
    const peak = Math.max(...out);
    return out.map((v) => Math.max(0.08, v / peak));
  }, [peaks, bars]);

  return (
    <div
      role={onSeek ? "slider" : undefined}
      aria-label="Seek within track"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={onSeek ? 0 : -1}
      className={`flex h-16 cursor-pointer items-center gap-[2px] ${className}`}
      onClick={(e) => {
        if (!onSeek) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onSeek(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
      }}
      onKeyDown={(e) => {
        if (!onSeek) return;
        if (e.key === "ArrowRight") onSeek(Math.min(1, progress + 0.05));
        if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 0.05));
      }}
    >
      {normalized.map((v, i) => {
        const played = i / normalized.length <= progress;
        return (
          <span
            key={i}
            className="min-w-0 flex-1 rounded-full transition-colors duration-150"
            style={{
              height: `${v * 100}%`,
              background: played ? "var(--accent)" : "var(--border-strong)",
              boxShadow: played ? "0 0 12px var(--accent-glow)" : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
