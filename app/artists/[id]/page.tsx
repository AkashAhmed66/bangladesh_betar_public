"use client";

import { use, useMemo } from "react";
import MediaCard from "@/components/cards/MediaCard";
import TrackTable from "@/components/cards/TrackTable";
import DetailHero from "@/components/detail/DetailHero";
import FollowButton from "@/components/ui/FollowButton";
import { PlayCircle, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { formatCount } from "@/lib/format";
import { useArtist } from "@/lib/hooks";
import { toTracks } from "@/lib/tracks";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useArtist(id);
  const artist = data?.data;
  const playContext = usePlayer((s) => s.playContext);
  const locale = useUi((s) => s.locale);

  const songs = useMemo(() => data?.songs.data ?? [], [data]);
  const albums = data?.albums.data ?? [];
  const tracks = useMemo(() => toTracks(songs), [songs]);

  if (isLoading || !artist) {
    return <Skeleton className="h-72 w-full rounded-panel" />;
  }

  const bio = locale === "bn" && artist.bio_bn ? artist.bio_bn : artist.bio;

  return (
    <div className="flex flex-col gap-8">
      <DetailHero
        type="artist"
        id={artist.id}
        artworkUrl={artist.photo_url}
        round
        kicker={artist.is_featured ? "Featured artist" : "Artist"}
        title={locale === "bn" && artist.name_bn ? artist.name_bn : artist.name}
        titleAlt={locale === "bn" ? artist.name : artist.name_bn}
        meta={
          <>
            {artist.artist_type && <span className="capitalize">{artist.artist_type}</span>}
            <span>· {formatCount(artist.followers_count)} followers</span>
          </>
        }
        actions={
          <>
            {tracks.length > 0 && (
              <PlayCircle size="size-14" icon="size-6" onClick={() => playContext(tracks, 0, artist.name)} label={`Play ${artist.name}`} />
            )}
            <FollowButton type="artist" id={artist.id} initial={artist.is_following} />
          </>
        }
      />

      {bio && <p className={`max-w-3xl text-sm leading-relaxed text-ink-soft ${locale === "bn" ? "font-bangla text-base" : ""}`}>{bio}</p>}

      {tracks.length > 0 && (
        <section>
          <SectionHeading title="Popular recordings" />
          <TrackTable
            tracks={tracks.slice(0, 10)}
            contextLabel={artist.name}
            showPlays
            playCounts={songs.map((s) => s.play_count)}
            favorited={songs.map((s) => s.is_favorited)}
          />
        </section>
      )}

      {albums.length > 0 && (
        <section>
          <SectionHeading title="Albums" />
          <div className="-mx-3 flex flex-wrap">
            {albums.map((a) => <MediaCard key={a.id} item={a} />)}
          </div>
        </section>
      )}
    </div>
  );
}
