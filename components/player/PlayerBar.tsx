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
import { artworkCss, artworkFor } from "@/lib/artwork";
import { formatDuration } from "@/lib/format";
import { useAuth } from "@/stores/auth";
import { useCurrentTrack, usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";
import { useTranslation } from "@/lib/i18n";

export default function PlayerBar() {
  const { t } = useTranslation();
  const track = useCurrentTrack();
  const {
    status, position, duration, volume, muted, repeat, shuffle, ad, adRemaining, stream,
    toggle, next, prev, seek, setVolume, toggleMute, cycleRepeat, toggleShuffle,
  } = usePlayer();
  const { toggleQueuePanel, setNowPlayingOpen, locale, openUpgradePrompt } = useUi();
  const isPremium = useAuth((s) => s.entitlements?.is_premium ?? false);

  const art = track ? artworkFor(track.type, track.id) : null;
  const title = track ? (locale === "bn" && track.titleBn ? track.titleBn : track.title) : null;
  const effectiveDuration = duration || track?.duration || 0;
  const isPlaying = status === "playing";
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <footer
      className={`relative z-50 flex h-[4.5rem] shrink-0 items-center gap-2 border-t border-edge bg-sunken px-2 sm:h-(--player-h) sm:gap-4 sm:px-4 ${art ? "artwork-themed artwork-player-shadow" : ""}`}
      style={art ? artworkCss(art) : undefined}
    >
      {/* Ad takeover state */}
      {ad ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-card bg-premium/15 sm:size-12">
            <Megaphone className="size-5 text-premium" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-premium">{t("player.advertisement")}</p>
            <p className="clamp-1 text-sm font-semibold">{ad.title}</p>
          </div>
          <div className="flex-1" />
          <p className="shrink-0 text-xs tabular-nums text-ink-soft sm:text-sm">
            <span className="hidden sm:inline">{t("player.audioStartsIn")} </span><span className="font-bold text-ink">{adRemaining}s</span>
          </p>
          <Link
            href="/premium"
            className="hidden rounded-full bg-premium px-4 py-1.5 text-xs font-bold text-premium-fg transition hover:scale-105 md:block"
          >
            {t("player.removeAds")}
          </Link>
        </div>
      ) : (
        <>
          {/* Left: track identity */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:w-1/3 sm:flex-none sm:gap-3 lg:w-1/4">
            {track ? (
              <>
                <button
                  onClick={() => setNowPlayingOpen(true)}
                  className="group relative shrink-0"
                  aria-label={t("player.openNowPlaying")}
                >
                  <Artwork type={track.type} id={track.id} url={track.artworkUrl} title={title ?? ""} className="size-11 sm:size-13" />
                  <span className="absolute inset-0 hidden items-center justify-center rounded-card bg-artwork-panel text-artwork-ink group-hover:flex">
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
                {!track.streamEndpoint && (
                  <FavoriteButton type="audio_asset" id={track.assetId} className="hidden shrink-0 sm:block" />
                )}
              </>
            ) : (
              <p className="hidden text-xs text-ink-mute sm:block">
                {t("player.pickSomething")}
              </p>
            )}
          </div>

          {/* Center: transport */}
          <div className="flex shrink-0 flex-col items-center gap-1.5 sm:flex-1">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <button
                onClick={toggleShuffle}
                aria-label={t("player.toggleShuffle")}
                aria-pressed={shuffle}
                className={`hidden transition sm:block ${shuffle ? "text-accent" : "text-ink-mute hover:text-ink"}`}
              >
                <Shuffle className="size-4" />
              </button>
              <button
                onClick={prev}
                aria-label={t("player.previous")}
                disabled={!track}
                className="text-ink-soft transition enabled:hover:text-ink disabled:opacity-30"
              >
                <SkipBack className="size-5 fill-current" />
              </button>
              <button
                onClick={toggle}
                disabled={!track}
                aria-label={isPlaying ? t("player.pause") : t("player.play")}
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
                aria-label={t("player.next")}
                disabled={!track}
                className="text-ink-soft transition enabled:hover:text-ink disabled:opacity-30"
              >
                <SkipForward className="size-5 fill-current" />
              </button>
              <button
                onClick={cycleRepeat}
                aria-label={t("player.repeat", { mode: repeat })}
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
              {/* Premium: draggable range. Free: read-only progress bar. */}
              {isPremium ? (
                <input
                  type="range"
                  className="seek w-full"
                  min={0}
                  max={Math.max(1, effectiveDuration)}
                  step={1}
                  value={Math.min(position, effectiveDuration)}
                  onChange={(e) => seek(Number(e.target.value))}
                  aria-label={t("player.seek")}
                  style={{
                    ["--track-bg" as string]: `linear-gradient(to right, var(--accent) ${
                      (Math.min(position, effectiveDuration) / Math.max(1, effectiveDuration)) * 100
                    }%, var(--border-strong) 0)`,
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    openUpgradePrompt({
                      title: t("player.seekingPremiumTitle"),
                      body: t("player.seekingPremiumBody"),
                    })
                  }
                  aria-label={t("player.seekingPremiumLabel")}
                  title={t("player.seekingPremiumLabel")}
                  className="group relative h-1.5 w-full cursor-not-allowed overflow-hidden rounded-full bg-edge-strong"
                >
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                    style={{ width: `${(Math.min(position, effectiveDuration) / Math.max(1, effectiveDuration)) * 100}%` }}
                  />
                </button>
              )}
              <span className="w-10 text-[11px] tabular-nums text-ink-mute">
                {formatDuration(effectiveDuration)}
              </span>
            </div>
          </div>

          {/* Right: volume & queue */}
          <div className="hidden w-1/4 items-center justify-end gap-3 md:flex">
            <button
              onClick={toggleQueuePanel}
              aria-label={t("player.queue")}
              className="text-ink-mute transition hover:text-ink"
            >
              <ListMusic className="size-4.5" />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} aria-label={muted ? t("player.unmute") : t("player.mute")} className="text-ink-mute transition hover:text-ink">
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
                aria-label={t("player.volume")}
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
