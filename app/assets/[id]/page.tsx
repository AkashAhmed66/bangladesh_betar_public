"use client";

import { ChevronDown, ListOrdered } from "lucide-react";
import { use, useMemo, useState } from "react";
import TrackTable from "@/components/cards/TrackTable";
import DetailHero from "@/components/detail/DetailHero";
import Comments from "@/components/engagement/Comments";
import Waveform from "@/components/player/Waveform";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { PlayCircle, PremiumBadge, SectionHeading, Skeleton } from "@/components/ui/Misc";
import TrackMenu from "@/components/ui/TrackMenu";
import { displayTitle, altTitle, formatCount, formatDuration, typeLabel } from "@/lib/format";
import { useAsset, useSimilar } from "@/lib/hooks";
import { toTrack, toTracks } from "@/lib/tracks";
import { useCurrentTrack, usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

/** Generic archive-recording page — the canonical "track page". */
export default function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useAsset(id);
  const asset = data?.data;
  const { data: similar } = useSimilar(asset?.id ?? null);
  const playTrack = usePlayer((s) => s.playTrack);
  const { position, duration, seek } = usePlayer();
  const current = useCurrentTrack();
  const locale = useUi((s) => s.locale);
  const [chaptersOpen, setChaptersOpen] = useState(true);

  const track = useMemo(() => (asset ? toTrack(asset) : null), [asset]);
  const similarTracks = useMemo(() => toTracks(similar?.data ?? []), [similar]);

  if (isLoading || !asset) {
    return <Skeleton className="h-72 w-full rounded-panel" />;
  }

  const isCurrent = current?.assetId === asset.id;
  const effectiveDuration = isCurrent ? duration || asset.duration_seconds || 1 : asset.duration_seconds || 1;

  return (
    <div className="flex flex-col gap-10">
      <DetailHero
        type="audio_asset"
        id={asset.id}
        artworkUrl={asset.artwork_url}
        kicker={typeLabel(asset.content_type) !== "Item" ? typeLabel(asset.content_type) : "Archive recording"}
        title={displayTitle(asset, locale)}
        titleAlt={altTitle(asset, locale)}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {asset.is_premium && <PremiumBadge />}
            <span className="font-semibold text-ink">
              {asset.artists?.map((a) => a.name).join(", ") || asset.programme || asset.station || "Bangladesh Betar"}
            </span>
          </span>
        }
        meta={
          <>
            {asset.category && <span>{asset.category}</span>}
            {asset.language && <span>· {asset.language}</span>}
            {asset.first_broadcast_on && <span>· First broadcast {asset.first_broadcast_on}</span>}
            <span>· {formatDuration(asset.duration_seconds)}</span>
            <span>· {formatCount(asset.play_count)} plays</span>
            <span>· {asset.archive_no}</span>
          </>
        }
        actions={
          <>
            {track && <PlayCircle size="size-14" icon="size-6" onClick={() => playTrack(track)} />}
            <FavoriteButton type="audio_asset" id={asset.id} initial={asset.is_favorited} size="size-7" />
            {track && <TrackMenu track={track} />}
          </>
        }
      />

      {asset.content_warning && (
        <p className="rounded-card border border-premium/30 bg-premium/8 px-4 py-3 text-sm text-premium">
          Content advisory: {asset.content_warning}
        </p>
      )}

      {/* Waveform — seekable while this asset is playing */}
      <section>
        <Waveform
          peaks={asset.waveform}
          progress={isCurrent ? Math.min(1, position / effectiveDuration) : 0}
          onSeek={isCurrent ? (f) => seek(f * effectiveDuration) : undefined}
        />
      </section>

      {asset.description && (
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">{asset.description}</p>
      )}

      {asset.chapters && asset.chapters.length > 0 && (
        <section>
          <SectionHeading
            title={<span className="flex items-center gap-2"><ListOrdered className="size-5 text-accent" /> Chapters</span>}
            action={
              <button
                type="button"
                onClick={() => setChaptersOpen((o) => !o)}
                aria-expanded={chaptersOpen}
                aria-label={chaptersOpen ? "Collapse chapters" : "Expand chapters"}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-mute transition hover:bg-raised hover:text-ink"
              >
                {chaptersOpen ? "Hide" : "Show"}
                <ChevronDown className={`size-4 transition-transform ${chaptersOpen ? "" : "-rotate-90"}`} />
              </button>
            }
          />
          {chaptersOpen && (
          <div className="flex flex-col">
            {asset.chapters.map((ch, i) => {
              const nextStart = asset.chapters![i + 1]?.start_seconds ?? Infinity;
              const active = isCurrent && position >= ch.start_seconds && position < nextStart;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (isCurrent) seek(ch.start_seconds);
                    else if (track) playTrack({ ...track, startAt: ch.start_seconds });
                  }}
                  className={`flex items-center gap-4 rounded-card px-3 py-2.5 text-left transition ${active ? "bg-raised" : "hover:bg-raised"}`}
                >
                  <span className="w-12 text-xs tabular-nums text-accent">{formatDuration(ch.start_seconds)}</span>
                  <span className={`flex-1 text-sm ${active ? "font-semibold text-ink" : "font-medium"}`}>{ch.title}</span>
                  {active && <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Playing</span>}
                </button>
              );
            })}
          </div>
          )}
        </section>
      )}

      {similarTracks.length > 0 && (
        <section>
          <SectionHeading title="More like this" />
          <TrackTable tracks={similarTracks.slice(0, 8)} contextLabel="Similar" />
        </section>
      )}

      <Comments
        assetId={asset.id}
        allowComments={asset.allow_comments}
        avgRating={asset.avg_rating}
        ratingCount={asset.rating_count}
        myRating={asset.my_rating}
      />
    </div>
  );
}
