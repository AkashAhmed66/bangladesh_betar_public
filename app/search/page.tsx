"use client";

import { Search as SearchIcon, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import MediaCard from "@/components/cards/MediaCard";
import TrackTable from "@/components/cards/TrackTable";
import { EmptyState, SectionHeading } from "@/components/ui/Misc";
import { artworkFor } from "@/lib/artwork";
import { useCategories, useGenres, useSearch, useSuggestions } from "@/lib/hooks";
import { toTracks } from "@/lib/tracks";
import type { CatalogueItem } from "@/lib/types";

const TABS = ["All", "Songs", "Artists", "Albums", "Podcasts", "Archive"] as const;
type Tab = (typeof TABS)[number];

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("All");
  const [showSuggest, setShowSuggest] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce typing → query
  useEffect(() => {
    const t = setTimeout(() => setQuery(input), 350);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => inputRef.current?.focus(), []);

  const { data: results, isLoading } = useSearch(query);
  const { data: suggestions } = useSuggestions(showSuggest ? input : "");
  const { data: genres } = useGenres();
  const { data: categories } = useCategories();

  const songs = useMemo(() => results?.results.songs?.data ?? [], [results]);
  const artists = results?.results.artists?.data ?? [];
  const albums = results?.results.albums?.data ?? [];
  const podcasts = results?.results.podcasts?.data ?? [];
  const audio = useMemo(() => results?.results.audio?.data ?? [], [results]);
  const songTracks = useMemo(() => toTracks(songs), [songs]);
  const audioTracks = useMemo(() => toTracks(audio), [audio]);

  const hasAny = songs.length + artists.length + albums.length + podcasts.length + audio.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Search box */}
      <div className="relative max-w-2xl">
        <div className="flex items-center gap-3 rounded-full border border-edge bg-raised px-5 py-3 transition focus-within:border-accent">
          <SearchIcon className="size-5 shrink-0 text-ink-mute" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggest(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
            onFocus={() => setShowSuggest(true)}
            placeholder="What do you want to listen to?"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-mute"
            aria-label="Search the archive"
          />
          {input && (
            <button onClick={() => { setInput(""); setQuery(""); }} aria-label="Clear search">
              <X className="size-4 text-ink-mute hover:text-ink" />
            </button>
          )}
        </div>

        {/* Type-ahead suggestions */}
        {showSuggest && (suggestions?.data.length ?? 0) > 0 && input !== query && (
          <div className="fade-up absolute z-40 mt-2 w-full rounded-panel border border-edge bg-raised p-1.5 shadow-2xl shadow-black/60">
            {suggestions!.data.map((s, i) => (
              <button
                key={`${s.text}-${i}`}
                onMouseDown={() => { setInput(s.text); setQuery(s.text); setShowSuggest(false); }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-highlight"
              >
                <SearchIcon className="size-3.5 text-ink-mute" />
                <span className="flex-1">{s.text}</span>
                <span className="text-[10px] uppercase tracking-wider text-ink-mute">{s.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Idle state: browse chips */}
      {!query && (
        <>
          <section>
            <SectionHeading title="Browse genres" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {(genres?.data ?? []).map((g) => {
                const art = artworkFor("genre", g.id);
                return (
                  <Link
                    key={g.id}
                    href={`/songs?genre=${g.id}`}
                    className="relative overflow-hidden rounded-card p-4 transition hover:scale-[1.02]"
                    style={{ background: `linear-gradient(135deg, ${art.from}, ${art.to})` }}
                  >
                    <p className="font-display text-base font-bold">{g.name}</p>
                    {g.name_bn && <p className="font-bangla text-xs text-white/60">{g.name_bn}</p>}
                  </Link>
                );
              })}
            </div>
          </section>
          <section>
            <SectionHeading title="Browse categories" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {(categories?.data ?? []).map((c) => {
                const art = artworkFor("category", c.id + 40);
                return (
                  <Link
                    key={c.id}
                    href="/browse"
                    className="relative overflow-hidden rounded-card p-4 transition hover:scale-[1.02]"
                    style={{ background: `linear-gradient(135deg, ${art.from}, ${art.to})` }}
                  >
                    <p className="font-display text-base font-bold">{c.name}</p>
                    {c.name_bn && <p className="font-bangla text-xs text-white/60">{c.name_bn}</p>}
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* Results */}
      {query && (
        <>
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  tab === t ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {isLoading && <p className="text-sm text-ink-mute">Searching “{query}”…</p>}

          {!isLoading && !hasAny && (
            <EmptyState
              icon={<SearchIcon className="size-10" />}
              title={`No results for “${query}”`}
              subtitle="Check the spelling, or try a song, artist, album or programme name — Bangla titles work too."
            />
          )}

          {(tab === "All" || tab === "Songs") && songTracks.length > 0 && (
            <section>
              <SectionHeading title="Songs" />
              <TrackTable tracks={tab === "All" ? songTracks.slice(0, 5) : songTracks} contextLabel={`Search: ${query}`} showPlays playCounts={songs.map((s) => s.play_count)} />
            </section>
          )}

          {(tab === "All" || tab === "Artists") && artists.length > 0 && (
            <section>
              <SectionHeading title="Artists" />
              <div className="-mx-3 flex flex-wrap">
                {artists.map((a) => <MediaCard key={a.id} item={a} />)}
              </div>
            </section>
          )}

          {(tab === "All" || tab === "Albums") && albums.length > 0 && (
            <section>
              <SectionHeading title="Albums" />
              <div className="-mx-3 flex flex-wrap">
                {albums.map((a) => <MediaCard key={a.id} item={a} />)}
              </div>
            </section>
          )}

          {(tab === "All" || tab === "Podcasts") && podcasts.length > 0 && (
            <section>
              <SectionHeading title="Podcasts" />
              <div className="-mx-3 flex flex-wrap">
                {podcasts.map((p) => <MediaCard key={p.id} item={p as CatalogueItem} />)}
              </div>
            </section>
          )}

          {(tab === "All" || tab === "Archive") && audioTracks.length > 0 && (
            <section>
              <SectionHeading title="Archive recordings" />
              <TrackTable tracks={tab === "All" ? audioTracks.slice(0, 5) : audioTracks} contextLabel={`Search: ${query}`} showPlays playCounts={audio.map((a) => a.play_count)} favorited={audio.map((a) => a.is_favorited)} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
