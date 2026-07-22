"use client";

import {
  ChevronUp,
  ListMusic,
  Loader2,
  Megaphone,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import Artwork from "@/components/ui/Artwork";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { PremiumBadge } from "@/components/ui/Misc";
import { artworkFor } from "@/lib/artwork";
import { formatDuration } from "@/lib/format";
import { useCurrentTrack, usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

export default function PlayerBar() {
  const track = useCurrentTrack();
  const {
    status, position, duration, volume, muted, repeat, shuffle, ad, adRemaining, stream,
    toggle, next, prev, seek, setVolume, toggleMute, cycleRepeat, toggleShuffle,
  } = usePlayer();
  const { toggleQueuePanel, setNowPlayingOpen, locale } = useUi();

  const art = track ? artworkFor(track.type, track.id) : null;
  const title = track ? (locale === "bn" && track.titleBn ? track.titleBn : track.title) : null;
  const effectiveDuration = duration || track?.duration || 0;
  const isPlaying = status === "playing";
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <footer
      className="relative z-50 flex h-(--player-h) items-center gap-4 border-t border-edge bg-sunken px-3 sm:px-4"
      style={art ? { boxShadow: `0 -18px 70px -32px ${art.accent}55` } : undefined}
    >
      {/* Ad takeover state */}
      {ad ? (
        <div className="flex flex-1 items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-card bg-premium/15">
            <Megaphone className="size-5 text-premium" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-premium">Advertisement</p>
            <p className="clamp-1 text-sm font-semibold">{ad.title}</p>
          </div>
          <div className="flex-1" />
          <p className="text-sm tabular-nums text-ink-soft">
            Your audio starts in <span className="font-bold text-ink">{adRemaining}s</span>
          </p>
          <Link
            href="/premium"
            className="hidden rounded-full bg-premium px-4 py-1.5 text-xs font-bold text-premium-fg transition hover:scale-105 md:block"
          >
            Remove ads
          </Link>
        </div>
      ) : (
        <>
          {/* Left: track identity */}
          <div className="flex w-1/3 min-w-0 items-center gap-3 lg:w-1/4">
            {track ? (
              <>
                <button
                  onClick={() => setNowPlayingOpen(true)}
                  className="group relative shrink-0"
                  aria-label="Open now playing"
                >
                  <Artwork type={track.type} id={track.id} url={track.artworkUrl} title={title ?? ""} className="size-13" />
                  <span className="absolute inset-0 hidden items-center justify-center rounded-card bg-black/50 group-hover:flex">
                    <ChevronUp className="size-5" />
                  </span>
                </button>
                <div className="min-w-0">
                  <Link href={track.href} className="clamp-1 text-sm font-semibold hover:underline">
                    {title}
                  </Link>
                  <div className="flex items-center gap-2">
                    {stream?.stream.is_preview && <PremiumBadge />}
                    <p className="clamp-1 text-xs text-ink-mute">{track.subtitle}</p>
                  </div>
                </div>
                <FavoriteButton type="audio_asset" id={track.assetId} className="hidden shrink-0 sm:block" />
              </>
            ) : (
              <p className="hidden text-xs text-ink-mute sm:block">
                Pick something to play — the archive is waiting.
              </p>
            )}
          </div>

          {/* Center: transport */}
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                aria-label="Toggle shuffle"
                aria-pressed={shuffle}
                className={`hidden transition sm:block ${shuffle ? "text-accent" : "text-ink-mute hover:text-ink"}`}
              >
                <Shuffle className="size-4" />
              </button>
              <button
                onClick={prev}
                aria-label="Previous"
                disabled={!track}
                className="text-ink-soft transition enabled:hover:text-ink disabled:opacity-30"
              >
                <SkipBack className="size-5 fill-current" />
              </button>
              <button
                onClick={toggle}
                disabled={!track}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex size-9 items-center justify-center rounded-full bg-ink text-page transition enabled:hover:scale-105 disabled:opacity-30"
              >
                {status === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="size-4 fill-current" />
                ) : (
                  <Play className="size-4 translate-x-[1px] fill-current" />
                )}
              </button>
              <button
                onClick={() => next(true)}
                aria-label="Next"
                disabled={!track}
                className="text-ink-soft transition enabled:hover:text-ink disabled:opacity-30"
              >
                <SkipForward className="size-5 fill-current" />
              </button>
              <button
                onClick={cycleRepeat}
                aria-label={`Repeat: ${repeat}`}
                className={`hidden transition sm:block ${repeat !== "off" ? "text-accent" : "text-ink-mute hover:text-ink"}`}
              >
                {repeat === "one" ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
              </button>
            </div>

            {/* Seek */}
            <div className="hidden w-full max-w-xl items-center gap-2 sm:flex">
              <span className="w-10 text-right text-[11px] tabular-nums text-ink-mute">
                {formatDuration(position)}
              </span>
              <input
                type="range"
                className="seek w-full"
                min={0}
                max={Math.max(1, effectiveDuration)}
                step={1}
                value={Math.min(position, effectiveDuration)}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="Seek"
                style={{
                  ["--track-bg" as string]: `linear-gradient(to right, var(--accent) ${
                    (Math.min(position, effectiveDuration) / Math.max(1, effectiveDuration)) * 100
                  }%, var(--border-strong) 0)`,
                }}
              />
              <span className="w-10 text-[11px] tabular-nums text-ink-mute">
                {formatDuration(effectiveDuration)}
              </span>
            </div>
          </div>

          {/* Right: volume & queue */}
          <div className="flex w-1/4 items-center justify-end gap-3">
            <button
              onClick={toggleQueuePanel}
              aria-label="Queue"
              className="hidden text-ink-mute transition hover:text-ink md:block"
            >
              <ListMusic className="size-4.5" />
            </button>
            <div className="hidden items-center gap-2 md:flex">
              <button onClick={toggleMute} aria-label="Mute" className="text-ink-mute transition hover:text-ink">
                <VolumeIcon className="size-4.5" />
              </button>
              <input
                type="range"
                className="seek w-24"
                min={0}
                max={1}
                step={0.02}
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
                style={{
                  ["--track-bg" as string]: `linear-gradient(to right, var(--text-primary) ${
                    (muted ? 0 : volume) * 100
                  }%, var(--border-strong) 0)`,
                }}
              />
            </div>
          </div>
        </>
      )}
    </footer>
  );
}
