"use client";

import { use, useMemo } from "react";
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
