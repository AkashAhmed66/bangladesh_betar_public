"use client";

import { BadgeCheck, ExternalLink, Music2 } from "lucide-react";
import { use, useMemo, useRef, useState } from "react";
import MediaCard from "@/components/cards/MediaCard";
import TrackTable from "@/components/cards/TrackTable";
import Artwork from "@/components/ui/Artwork";
import FollowButton from "@/components/ui/FollowButton";
import { EmptyState, PlayCircle, SectionHeading, Skeleton } from "@/components/ui/Misc";
import Pagination from "@/components/ui/Pagination";
import ShareButton from "@/components/ui/ShareButton";
import { artworkCss, artworkFor } from "@/lib/artwork";
import { formatCount } from "@/lib/format";
import { useArtist } from "@/lib/hooks";
import { toTracks } from "@/lib/tracks";
import type { Song } from "@/lib/types";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

/** Group an artist's recordings by genre. */
function groupByGenre(songs: Song[]): { key: string; label: string; songs: Song[] }[] {
  const map = new Map<string, Song[]>();
  for (const s of songs) {
    const key = s.genre || "Other";
    const arr = map.get(key);
    if (arr) arr.push(s);
    else map.set(key, [s]);
  }
  return [...map.entries()]
    .map(([label, list]) => ({ key: label, label, songs: list }))
    .sort((a, b) => b.songs.length - a.songs.length);
}

const SOCIAL_LABELS: Record<string, string> = {
  website: "Website",
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "X / Twitter",
  spotify: "Spotify",
};

const PAGE_SIZE = 25;

/** A track list whose rows carry play counts + favourite state, in order. */
function SongTable({ songs, label, startIndexAt = 0 }: { songs: Song[]; label: string; startIndexAt?: number }) {
  return (
    <TrackTable
      tracks={toTracks(songs)}
      contextLabel={label}
      showPlays
      playCounts={songs.map((s) => s.play_count)}
      favorited={songs.map((s) => s.is_favorited)}
      startIndexAt={startIndexAt}
    />
  );
}

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useArtist(id);
  const artist = data?.data;
  const playContext = usePlayer((s) => s.playContext);
  const locale = useUi((s) => s.locale);
  const [tab, setTab] = useState<"played" | "recent" | "rated" | "genre">("played");
  const [page, setPage] = useState(1);
  const recordingsRef = useRef<HTMLElement>(null);

  // Switching category resets to the first page.
  const selectTab = (key: "played" | "recent" | "rated" | "genre") => {
    setTab(key);
    setPage(1);
  };
  const goPage = (p: number) => {
    setPage(p);
    recordingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const songs = useMemo(() => data?.songs.data ?? [], [data]);
  const albums = data?.albums?.data ?? [];
  const similar = data?.similar?.data ?? [];

  // Categorised orderings of the same recordings.
  const byPlayed = useMemo(() => [...songs].sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0)), [songs]);
  const byRecent = useMemo(() => [...songs].sort((a, b) => (b.release_year ?? 0) - (a.release_year ?? 0)), [songs]);
  const byRated = useMemo(
    () => songs.filter((s) => (s.avg_rating ?? 0) > 0).sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0)),
    [songs],
  );
  const groups = useMemo(() => groupByGenre(songs), [songs]);
  const allTracks = useMemo(() => toTracks(byPlayed), [byPlayed]);
  const popular = useMemo(() => byPlayed.slice(0, 5), [byPlayed]);

  const tabs = useMemo(() => {
    const t: { key: typeof tab; label: string }[] = [{ key: "played", label: "Most played" }];
    if (byRecent.some((s) => s.release_year)) t.push({ key: "recent", label: "Recent" });
    if (byRated.length > 0) t.push({ key: "rated", label: "Top rated" });
    if (groups.length > 1) t.push({ key: "genre", label: "By genre" });
    return t;
  }, [byRecent, byRated, groups]);

  if (isLoading || !artist) {
    return <Skeleton className="h-80 w-full rounded-panel" />;
  }

  const name = locale === "bn" && artist.name_bn ? artist.name_bn : artist.name;
  const altName = locale === "bn" ? artist.name : artist.name_bn;
  const bio = locale === "bn" && artist.bio_bn ? artist.bio_bn : artist.bio;
  const art = artworkFor("artist", artist.id);
  const socials = Object.entries(artist.social_links ?? {}).filter(([, url]) => !!url);
  const hasBody = songs.length > 0 || albums.length > 0;
  const activeList = tab === "recent" ? byRecent : tab === "rated" ? byRated : byPlayed;
  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedList = activeList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-10">
      {/* ---- Hero: cover banner + avatar + identity ---- */}
      <header className="relative -mx-4 -mt-4 sm:-mx-6">
        <div className="relative h-48 w-full overflow-hidden sm:h-64 lg:h-72">
          {artist.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artist.cover_url} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full" style={artworkCss(art)} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-page via-page/75 to-transparent" />
        </div>

        <div className="relative -mt-20 flex flex-col items-start gap-5 px-4 sm:-mt-24 sm:flex-row sm:items-end sm:px-6">
          <Artwork
            type="artist"
            id={artist.id}
            url={artist.photo_url}
            title={artist.name}
            className="aspect-square w-32 shadow-2xl shadow-black/60 sm:w-44"
            iconClassName="size-1/4"
            rounded="rounded-full"
          />
          <div className="min-w-0 flex-1 pb-1">
            {artist.is_verified && (
              <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                <BadgeCheck className="size-4" /> Verified Artist
              </span>
            )}
            <h1 className="break-words font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              {name}
            </h1>
            {altName && <p className="font-bangla mt-1 text-lg text-ink-soft">{altName}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
              {artist.artist_type && <span className="capitalize">{artist.artist_type}</span>}
              {artist.monthly_listeners != null && (
                <span>· <strong className="font-semibold text-ink">{formatCount(artist.monthly_listeners)}</strong> monthly listeners</span>
              )}
              <span>· {formatCount(artist.followers_count)} followers</span>
            </div>
          </div>
        </div>
      </header>

      {/* ---- Actions ---- */}
      <div className="-mt-4 flex flex-wrap items-center gap-4">
        {allTracks.length > 0 && (
          <PlayCircle
            size="size-14"
            icon="size-6"
            onClick={() => playContext(allTracks, 0, artist.name)}
            label={`Play ${artist.name}`}
          />
        )}
        <FollowButton type="artist" id={artist.id} initial={artist.is_following} />
        <ShareButton title={artist.name} text={`${artist.name} on Betar Tarango`} />
      </div>

      {/* ---- Popular ---- */}
      {popular.length > 0 && (
        <section>
          <SectionHeading title="Popular" />
          <SongTable songs={popular} label={artist.name} />
        </section>
      )}

      {/* ---- Discography ---- */}
      {albums.length > 0 && (
        <section>
          <SectionHeading title="Discography" />
          <div className="-mx-3 flex flex-wrap">
            {albums.map((a) => <MediaCard key={a.id} item={a} />)}
          </div>
        </section>
      )}

      {/* ---- All recordings, categorised + paginated ---- */}
      {songs.length > 0 && (
        <section ref={recordingsRef} className="scroll-mt-24">
          <SectionHeading
            title="All recordings"
            action={<span className="text-xs text-ink-mute">{songs.length} tracks</span>}
          />
          {tabs.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => selectTab(t.key)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    tab === t.key ? "bg-accent text-accent-fg" : "bg-raised text-ink-soft hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {tab === "genre" ? (
            <div className="flex flex-col gap-7">
              {groups.map((g) => (
                <div key={g.key}>
                  <h3 className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-ink-soft">
                    {g.label} <span className="text-xs font-normal text-ink-mute">{g.songs.length}</span>
                  </h3>
                  <SongTable songs={g.songs} label={`${artist.name} — ${g.label}`} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <SongTable songs={pagedList} label={artist.name} startIndexAt={(safePage - 1) * PAGE_SIZE} />
              <Pagination page={safePage} totalPages={totalPages} onChange={goPage} className="mt-6" />
            </>
          )}
        </section>
      )}

      {/* ---- Related artists ---- */}
      {similar.length > 0 && (
        <section>
          <SectionHeading title="Related artists" />
          <div className="-mx-3 flex flex-wrap">
            {similar.map((a) => <MediaCard key={a.id} item={a} />)}
          </div>
        </section>
      )}

      {/* ---- About ---- */}
      {(bio || socials.length > 0) && (
        <section>
          <SectionHeading title="About" />
          {bio && (
            <p className={`max-w-3xl whitespace-pre-line text-sm leading-relaxed text-ink-soft ${locale === "bn" ? "font-bangla text-base" : ""}`}>
              {bio}
            </p>
          )}
          {socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-ink hover:text-ink"
                >
                  <ExternalLink className="size-3.5" /> {SOCIAL_LABELS[key] ?? key}
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- Empty ---- */}
      {!hasBody && (
        <EmptyState
          icon={<Music2 className="size-8" />}
          title="No recordings yet"
          subtitle={`${artist.name} doesn't have any published recordings on Betar Tarango yet.`}
        />
      )}
    </div>
  );
}
