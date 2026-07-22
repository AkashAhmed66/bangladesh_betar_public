"use client";

import { Pause, Play, X } from "lucide-react";
import Link from "next/link";
import Artwork from "@/components/ui/Artwork";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { PremiumBadge } from "@/components/ui/Misc";
import TrackMenu from "@/components/ui/TrackMenu";
import { formatCount, formatDuration } from "@/lib/format";
import type { PlayerTrack } from "@/stores/player";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

interface TrackTableProps {
  tracks: PlayerTrack[];
  contextLabel?: string;
  showArtwork?: boolean;
  showPlays?: boolean;
  playCounts?: (number | null | undefined)[];
  favorited?: (boolean | undefined)[];
  startIndexAt?: number;
  /** When set, rows get a remove (×) action (e.g. playlist owner view). */
  onRemove?: (index: number) => void;
}

/** Numbered track list — the album/playlist body, Spotify-style. */
export default function TrackTable({
  tracks,
  contextLabel,
  showArtwork = true,
  showPlays = false,
  playCounts,
  favorited,
  startIndexAt = 0,
  onRemove,
}: TrackTableProps) {
  const playContext = usePlayer((s) => s.playContext);
  const toggle = usePlayer((s) => s.toggle);
  const status = usePlayer((s) => s.status);
  const currentKey = usePlayer((s) => s.queue[s.index]?.key);
  const locale = useUi((s) => s.locale);

  if (!tracks.length) return null;

  return (
    <div role="list" className="flex flex-col">
      {tracks.map((track, i) => {
        const isCurrent = currentKey === track.key;
        const isPlaying = isCurrent && status === "playing";
        const title = locale === "bn" && track.titleBn ? track.titleBn : track.title;

        return (
          <div
            key={track.key}
            role="listitem"
            onDoubleClick={() => playContext(tracks, i, contextLabel)}
            className={`group grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-card px-3 py-2 transition-colors sm:grid-cols-[2rem_4fr_2fr_minmax(0,6rem)_auto] ${
              isCurrent ? "bg-highlight/60" : "hover:bg-raised"
            }`}
          >
            {/* Index / play control */}
            <button
              aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
              onClick={() => (isCurrent ? toggle() : playContext(tracks, i, contextLabel))}
              className="flex size-8 items-center justify-center text-sm tabular-nums text-ink-mute"
            >
              {isPlaying ? (
                <span className="eq-bars flex h-4 items-end gap-[3px] group-hover:hidden" aria-hidden>
                  <span /><span /><span />
                </span>
              ) : (
                <span className={`group-hover:hidden ${isCurrent ? "text-accent" : ""}`}>{startIndexAt + i + 1}</span>
              )}
              <span className="hidden text-ink group-hover:block">
                {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
              </span>
            </button>

            {/* Title */}
            <div className="flex min-w-0 items-center gap-3">
              {showArtwork && (
                <Artwork type={track.type} id={track.id} url={track.artworkUrl} title={title} className="size-10 shrink-0" />
              )}
              <div className="min-w-0">
                <Link
                  href={track.href}
                  className={`clamp-1 text-sm font-medium hover:underline ${isCurrent ? "text-accent" : ""}`}
                >
                  {title}
                </Link>
                <div className="flex items-center gap-2">
                  {track.isPremium && <PremiumBadge />}
                  <p className="clamp-1 text-xs text-ink-mute">{track.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Plays (wide screens) */}
            <p className="hidden text-right text-xs tabular-nums text-ink-mute sm:block">
              {showPlays && playCounts?.[i] != null ? formatCount(playCounts[i]) : ""}
            </p>

            {/* Duration */}
            <p className="hidden text-right text-xs tabular-nums text-ink-mute sm:block">
              {formatDuration(track.duration)}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
              <FavoriteButton type="audio_asset" id={track.assetId} initial={favorited?.[i]} />
              <TrackMenu track={track} />
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(i);
                  }}
                  aria-label={`Remove ${title}`}
                  className="rounded-full p-1 text-ink-mute transition hover:text-danger"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
