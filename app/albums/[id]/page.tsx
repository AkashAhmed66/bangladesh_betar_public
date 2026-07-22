"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import TrackTable from "@/components/cards/TrackTable";
import DetailHero from "@/components/detail/DetailHero";
import { PlayCircle, Skeleton } from "@/components/ui/Misc";
import { displayTitle, altTitle, formatDuration } from "@/lib/format";
import { useAlbum } from "@/lib/hooks";
import { toTracks } from "@/lib/tracks";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useAlbum(id);
  const album = data?.data;
  const playContext = usePlayer((s) => s.playContext);
  const locale = useUi((s) => s.locale);

  const tracks = useMemo(() => toTracks(album?.tracks ?? []), [album]);
  const totalSeconds = useMemo(
    () => (album?.tracks ?? []).reduce((sum, t) => sum + (t.duration_seconds ?? 0), 0),
    [album],
  );

  if (isLoading || !album) {
    return <Skeleton className="h-72 w-full rounded-panel" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <DetailHero
        type="album"
        id={album.id}
        artworkUrl={album.artwork_url}
        kicker={album.album_type ? album.album_type[0].toUpperCase() + album.album_type.slice(1) : "Album"}
        title={displayTitle(album, locale)}
        titleAlt={altTitle(album, locale)}
        subtitle={
          <span className="flex flex-wrap gap-1">
            {(album.artists ?? []).map((a, i) => (
              <span key={a.id}>
                <Link href={`/artists/${a.id}`} className="font-semibold text-ink hover:underline">{a.name}</Link>
                {i < (album.artists?.length ?? 0) - 1 && ", "}
              </span>
            ))}
          </span>
        }
        meta={
          <>
            {album.year && <span>{album.year}</span>}
            <span>· {tracks.length} tracks</span>
            {totalSeconds > 0 && <span>· {formatDuration(totalSeconds)}</span>}
          </>
        }
        actions={
          tracks.length > 0 && (
            <PlayCircle size="size-14" icon="size-6" onClick={() => playContext(tracks, 0, album.title)} label={`Play ${album.title}`} />
          )
        }
      />

      {album.description && (
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">{album.description}</p>
      )}

      <TrackTable
        tracks={tracks}
        contextLabel={album.title}
        showArtwork={false}
        showPlays
        playCounts={(album.tracks ?? []).map((t) => t.play_count)}
        favorited={(album.tracks ?? []).map((t) => t.is_favorited)}
      />
    </div>
  );
}
