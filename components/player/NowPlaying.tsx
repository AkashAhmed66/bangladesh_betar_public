"use client";

import {
  ChevronDown,
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Link from "next/link";
import Artwork from "@/components/ui/Artwork";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { PremiumBadge } from "@/components/ui/Misc";
import Waveform from "./Waveform";
import { artworkFor } from "@/lib/artwork";
import { formatCount, formatDuration } from "@/lib/format";
import { useAsset } from "@/lib/hooks";
import { useCurrentTrack, usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

/** Immersive full-screen player with waveform seeking and asset context. */
export default function NowPlaying() {
  const open = useUi((s) => s.nowPlayingOpen);
  const setOpen = useUi((s) => s.setNowPlayingOpen);
  const locale = useUi((s) => s.locale);
  const track = useCurrentTrack();
  const {
    status, position, duration, repeat, shuffle, stream,
    toggle, next, prev, seek, cycleRepeat, toggleShuffle,
  } = usePlayer();

  const { data: assetRes } = useAsset(open && track ? track.assetId : null);
  const asset = assetRes?.data;

  if (!open || !track) return null;

  const art = artworkFor(track.type, track.id);
  const title = locale === "bn" && track.titleBn ? track.titleBn : track.title;
  const effectiveDuration = duration || track.duration || 1;
  const isPlaying = status === "playing";

  return (
    <div className="fixed inset-0 z-110 flex flex-col overflow-y-auto bg-page">
      {/* ambient backdrop from the artwork's palette */}
      <div
        aria-hidden
        className="ambient-drift pointer-events-none absolute -top-1/4 left-1/2 h-[80vh] w-[80vw] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${art.accent}, transparent 70%)` }}
      />

      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <button
          onClick={() => setOpen(false)}
          aria-label="Minimise player"
          className="rounded-full bg-raised/70 p-2 text-ink-soft transition hover:text-ink"
        >
          <ChevronDown className="size-5" />
        </button>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-mute">Now playing</p>
        <span className="w-9" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-6 pb-12">
        <Artwork
          type={track.type}
          id={track.id}
          url={track.artworkUrl}
          title={title}
          className="aspect-square w-64 shadow-2xl shadow-black/60 sm:w-80"
          iconClassName="size-1/4"
        />

        <div className="w-full text-center">
          <div className="mb-1 flex items-center justify-center gap-2">
            {stream?.stream.is_preview && <PremiumBadge />}
            {asset?.category && (
              <span className="rounded-full bg-raised px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                {asset.category}
              </span>
            )}
          </div>
          <Link href={track.href} onClick={() => setOpen(false)} className="font-display text-2xl font-bold tracking-tight hover:underline sm:text-3xl">
            {title}
          </Link>
          <p className="mt-1 text-sm text-ink-soft">{track.subtitle}</p>
          {asset && (
            <p className="mt-2 text-xs text-ink-mute">
              {formatCount(asset.play_count)} plays
              {asset.first_broadcast_on ? ` · first broadcast ${asset.first_broadcast_on.slice(0, 4)}` : ""}
              {asset.station ? ` · ${asset.station}` : ""}
            </p>
          )}
        </div>

        {/* Waveform seek */}
        <div className="w-full">
          <Waveform
            peaks={asset?.waveform}
            progress={Math.min(1, position / effectiveDuration)}
            onSeek={(f) => seek(f * effectiveDuration)}
          />
          <div className="mt-1 flex justify-between text-[11px] tabular-nums text-ink-mute">
            <span>{formatDuration(position)}</span>
            <span>{formatDuration(effectiveDuration)}</span>
          </div>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-7">
          <button
            onClick={toggleShuffle}
            aria-pressed={shuffle}
            aria-label="Shuffle"
            className={shuffle ? "text-accent" : "text-ink-mute hover:text-ink"}
          >
            <Shuffle className="size-5" />
          </button>
          <button onClick={prev} aria-label="Previous" className="text-ink-soft transition hover:text-ink">
            <SkipBack className="size-7 fill-current" />
          </button>
          <button
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex size-16 items-center justify-center rounded-full bg-ink text-page shadow-xl transition hover:scale-105"
          >
            {status === "loading" ? (
              <Loader2 className="size-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="size-6 fill-current" />
            ) : (
              <Play className="size-6 translate-x-[2px] fill-current" />
            )}
          </button>
          <button onClick={() => next(true)} aria-label="Next" className="text-ink-soft transition hover:text-ink">
            <SkipForward className="size-7 fill-current" />
          </button>
          <button
            onClick={cycleRepeat}
            aria-label={`Repeat: ${repeat}`}
            className={repeat !== "off" ? "text-accent" : "text-ink-mute hover:text-ink"}
          >
            {repeat === "one" ? <Repeat1 className="size-5" /> : <Repeat className="size-5" />}
          </button>
        </div>

        <FavoriteButton
          type="audio_asset"
          id={track.assetId}
          initial={asset?.is_favorited}
          size="size-6"
        />
      </div>
    </div>
  );
}
