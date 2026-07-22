"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import TrackTable from "@/components/cards/TrackTable";
import DetailHero from "@/components/detail/DetailHero";
import Comments from "@/components/engagement/Comments";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { PlayCircle, PremiumBadge, SectionHeading, Skeleton } from "@/components/ui/Misc";
import TrackMenu from "@/components/ui/TrackMenu";
import { displayTitle, altTitle, formatCount, formatDuration } from "@/lib/format";
import { useAsset, useSimilar, useSong } from "@/lib/hooks";
import { toTrack, toTracks } from "@/lib/tracks";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

export default function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useSong(id);
  const song = data?.data;
  const { data: assetRes } = useAsset(song?.audio_asset_id ?? null);
  const { data: similar } = useSimilar(song?.audio_asset_id ?? null);
  const playTrack = usePlayer((s) => s.playTrack);
  const locale = useUi((s) => s.locale);
  const [lyricsLang, setLyricsLang] = useState<"bn" | "en">("bn");

  const track = useMemo(() => (song ? toTrack(song) : null), [song]);
  const similarTracks = useMemo(() => toTracks(similar?.data ?? []), [similar]);
  const asset = assetRes?.data;

  if (isLoading || !song) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full rounded-panel" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    );
  }

  const lyrics = song.lyrics?.[lyricsLang] ?? song.lyrics?.en ?? song.lyrics?.bn;

  return (
    <div className="flex flex-col gap-10">
      <DetailHero
        type="song"
        id={song.id}
        artworkUrl={song.artwork_url}
        kicker={`Song${song.version_type && song.version_type !== "original" ? ` · ${song.version_type}` : ""}`}
        title={displayTitle(song, locale)}
        titleAlt={altTitle(song, locale)}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {song.is_premium && <PremiumBadge />}
            <span className="font-semibold text-ink">{song.singers?.join(", ") || "Unknown artist"}</span>
            {song.album && (
              <>
                <span>·</span>
                <Link href={`/albums/${song.album.id}`} className="hover:underline">{song.album.title}</Link>
              </>
            )}
          </span>
        }
        meta={
          <>
            {song.genre && <span>{song.genre}</span>}
            {song.mood && <span>· {song.mood}</span>}
            {song.release_year && <span>· {song.release_year}</span>}
            <span>· {formatDuration(song.duration_seconds)}</span>
            {song.play_count != null && <span>· {formatCount(song.play_count)} plays</span>}
            {song.archive_no && <span>· {song.archive_no}</span>}
          </>
        }
        actions={
          <>
            {track && <PlayCircle size="size-14" icon="size-6" onClick={() => playTrack(track)} />}
            <FavoriteButton type="audio_asset" id={song.audio_asset_id} initial={song.is_favorited} size="size-7" />
            {track && <TrackMenu track={track} />}
          </>
        }
      />

      {lyrics && (
        <section>
          <SectionHeading
            title="Lyrics"
            action={
              <div className="flex gap-1 rounded-full bg-raised p-1">
                {(["bn", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLyricsLang(l)}
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase transition ${
                      lyricsLang === l ? "bg-ink text-page" : "text-ink-mute hover:text-ink"
                    }`}
                  >
                    {l === "bn" ? "বাংলা" : "EN"}
                  </button>
                ))}
              </div>
            }
          />
          <p className={`max-w-2xl whitespace-pre-wrap text-sm leading-7 text-ink-soft ${lyricsLang === "bn" ? "font-bangla text-base" : ""}`}>
            {lyrics}
          </p>
        </section>
      )}

      {similarTracks.length > 0 && (
        <section>
          <SectionHeading title="Similar recordings" />
          <TrackTable tracks={similarTracks.slice(0, 8)} contextLabel="Similar" />
        </section>
      )}

      {asset && (
        <Comments
          assetId={asset.id}
          allowComments={asset.allow_comments}
          avgRating={asset.avg_rating}
          ratingCount={asset.rating_count}
          myRating={asset.my_rating}
        />
      )}
    </div>
  );
}
