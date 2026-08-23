"use client";

import { Search as SearchIcon, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ListenPageHero from "@/components/cards/ListenPageHero";
import MediaCard from "@/components/cards/MediaCard";
import TrackTable from "@/components/cards/TrackTable";
import RecordedBroadcastTable from "@/components/live/RecordedBroadcastTable";
import VoiceSearchButton from "@/components/search/VoiceSearchButton";
import Artwork from "@/components/ui/Artwork";
import { EmptyState, PremiumBadge, SectionHeading } from "@/components/ui/Misc";
import { artworkCss, artworkFor } from "@/lib/artwork";
import { displayTitle } from "@/lib/format";
import { useCategories, useGenres, useSearch, useSuggestions } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import { toTracks } from "@/lib/tracks";
import type { CatalogueItem } from "@/lib/types";

const TABS = ["All", "Songs", "Artists", "Programmes", "Episodes", "Podcasts", "Audio Books", "Old Broadcasts", "Radio"] as const;
type Tab = (typeof TABS)[number];
const TAB_KEYS: Record<Tab, string> = {
  All: "all", Songs: "songs", Artists: "artists", Programmes: "programmes",
  Episodes: "episodes", Podcasts: "podcasts", "Audio Books": "audioBooks",
  "Old Broadcasts": "oldBroadcasts", Radio: "radio",
};

export default function SearchPage() {
  const { locale, t } = useTranslation();
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
  const artists = useMemo(() => results?.results.artists?.data ?? [], [results]);
  const liveRadios = useMemo(() => results?.results.live_radios?.data ?? [], [results]);
  const programmes = useMemo(() => results?.results.programmes?.data ?? [], [results]);
  // Programme episodes and podcast episodes are shown together under "Episodes".
  const episodeItems = useMemo(
    () => [...(results?.results.episodes?.data ?? []), ...(results?.results.podcast_episodes?.data ?? [])],
    [results],
  );
  const podcasts = useMemo(() => results?.results.podcasts?.data ?? [], [results]);
  const audiobooks = useMemo(() => results?.results.audiobooks?.data ?? [], [results]);
  const broadcastRecordings = useMemo(() => results?.results.broadcast_recordings?.data ?? [], [results]);
  const songTracks = useMemo(() => toTracks(songs), [songs]);
  const episodeTracks = useMemo(() => toTracks(episodeItems), [episodeItems]);

  const hasAny =
    songs.length + artists.length + programmes.length + episodeItems.length + podcasts.length + audiobooks.length + broadcastRecordings.length + liveRadios.length > 0;

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <ListenPageHero
        eyebrow={t("searchPage.eyebrow")}
        title={t("searchPage.title")}
        description={t("searchPage.description")}
        icon={<SearchIcon className="size-3.5" />}
      />
      {/* Search box */}
      <div className="relative -mt-4 max-w-4xl sm:-mt-6">
        <div className="flex min-h-16 items-center gap-3 rounded-full border border-edge-strong bg-raised px-6 shadow-xl shadow-shade/10 transition-colors focus-within:border-accent focus-within:ring-4 focus-within:ring-[var(--accent-glow)]">
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") setShowSuggest(false);
            }}
            placeholder={t("searchPage.placeholder")}
            // Inline `outline: none` beats the global unlayered :focus-visible
            // rule, so the input never draws its own (inner) outline — the
            // container's focus-within border is the focus indicator instead.
            style={{ outline: "none" }}
            className="w-full bg-transparent text-base font-semibold placeholder:font-medium placeholder:text-ink-mute sm:text-lg"
            aria-label={t("searchPage.eyebrow")}
          />
          {input && (
            <button onClick={() => { setInput(""); setQuery(""); }} aria-label={t("searchPage.clear")}>
              <X className="size-4 text-ink-mute hover:text-ink" />
            </button>
          )}
          <VoiceSearchButton
            onResult={(t) => { setInput(t); setQuery(t); setShowSuggest(false); }}
          />
        </div>

        {/* Type-ahead suggestions — visibility is driven by focus/selection
            (showSuggest), NOT by the debounce catching up: `input !== query`
            here made the list vanish 350ms after the last keystroke. */}
        {showSuggest && input.trim() !== "" && (suggestions?.data.length ?? 0) > 0 && (
          <div className="fade-up absolute z-40 mt-2 w-full rounded-panel border border-edge bg-raised p-1.5 shadow-2xl shadow-shade/35">
            {suggestions!.data.map((s, i) => (
              <button
                key={`${s.text}-${i}`}
                onMouseDown={() => { setInput(s.text); setQuery(s.text); setShowSuggest(false); }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-highlight"
              >
                <SearchIcon className="size-3.5 text-ink-mute" />
                <span className="flex-1">{s.text}</span>
                <span className="text-[10px] uppercase tracking-wider text-ink-mute">{s.type.replaceAll("_", " ")}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Idle state: browse chips */}
      {!query && (
        <>
          <section>
            <SectionHeading title={t("searchPage.genres")} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {(genres?.data ?? []).map((g) => {
                const art = artworkFor("genre", g.id);
                return (
                  <Link
                    key={g.id}
                    href={`/songs?genre=${g.id}`}
                    className="artwork-themed artwork-surface relative overflow-hidden rounded-card p-4 text-artwork-ink transition hover:scale-[1.02]"
                    style={artworkCss(art)}
                  >
                    <p className="font-display text-base font-bold">{localizedText(g as unknown as Record<string, unknown>, "name", locale)}</p>
                    {g.name_bn && <p className="font-bangla text-xs text-artwork-ink/60">{locale === "bn" ? g.name : g.name_bn}</p>}
                  </Link>
                );
              })}
            </div>
          </section>
          <section>
            <SectionHeading title={t("searchPage.categories")} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {(categories?.data ?? []).map((c) => {
                const art = artworkFor("category", c.id + 40);
                return (
                  <Link
                    key={c.id}
                    href="/browse"
                    className="artwork-themed artwork-surface relative overflow-hidden rounded-card p-4 text-artwork-ink transition hover:scale-[1.02]"
                    style={artworkCss(art)}
                  >
                    <p className="font-display text-base font-bold">{localizedText(c as unknown as Record<string, unknown>, "name", locale)}</p>
                    {c.name_bn && <p className="font-bangla text-xs text-artwork-ink/60">{locale === "bn" ? c.name : c.name_bn}</p>}
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
            {TABS.map((tabName) => (
              <button
                key={tabName}
                onClick={() => setTab(tabName)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  tab === tabName ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
                }`}
              >
                {t(`searchPage.${TAB_KEYS[tabName]}`)}
              </button>
            ))}
          </div>

          {isLoading && <p className="text-sm text-ink-mute">{t("searchPage.searching", { query })}</p>}

          {!isLoading && !hasAny && (
            <EmptyState
              icon={<SearchIcon className="size-10" />}
              title={t("searchPage.noResults", { query })}
              subtitle={t("searchPage.noResultsDescription")}
            />
          )}

          {(tab === "All" || tab === "Songs") && songTracks.length > 0 && (
            <section>
              <SectionHeading title={t("searchPage.songs")} />
              <TrackTable tracks={tab === "All" ? songTracks.slice(0, 5) : songTracks} contextLabel={t("searchPage.context", { query })} showPlays playCounts={songs.map((s) => s.play_count)} />
            </section>
          )}

          {(tab === "All" || tab === "Artists") && artists.length > 0 && (
            <section>
              <SectionHeading title={t("searchPage.artists")} />
              <div className="-mx-3 flex flex-wrap">
                {(tab === "All" ? artists.slice(0, 6) : artists).map((a) => (
                  <MediaCard key={`artist-${a.id}`} item={a} />
                ))}
              </div>
            </section>
          )}

          {(tab === "All" || tab === "Programmes") && programmes.length > 0 && (
            <section>
              <SectionHeading title={t("searchPage.programmes")} />
              <div className="-mx-3 flex flex-wrap">
                {programmes.map((p) => <MediaCard key={`programme-${p.id}`} item={p} />)}
              </div>
            </section>
          )}

          {(tab === "All" || tab === "Episodes") && episodeTracks.length > 0 && (
            <section>
              <SectionHeading title={t("searchPage.episodes")} />
              <TrackTable tracks={tab === "All" ? episodeTracks.slice(0, 5) : episodeTracks} contextLabel={t("searchPage.context", { query })} showPlays playCounts={episodeItems.map((e) => e.play_count)} />
            </section>
          )}

          {(tab === "All" || tab === "Podcasts") && podcasts.length > 0 && (
            <section>
              <SectionHeading title={t("searchPage.podcasts")} />
              <div className="-mx-3 flex flex-wrap">
                {podcasts.map((p) => <MediaCard key={`podcast-${p.id}`} item={p as CatalogueItem} />)}
              </div>
            </section>
          )}

          {(tab === "All" || tab === "Audio Books") && audiobooks.length > 0 && (
            <section>
              <SectionHeading title={t("searchPage.audioBooks")} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(tab === "All" ? audiobooks.slice(0, 6) : audiobooks).map((book) => {
                  return (
                    <Link
                      key={`audio-book-${book.id}`}
                      href={`/audiobooks/${book.id}`}
                      className="group relative flex min-h-28 items-center gap-4 overflow-hidden rounded-card bg-elev p-3 transition hover:bg-raised"
                    >
                      <Artwork type="audio_book" id={book.id} url={book.artwork_url} title={book.title} className="size-20 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className={`block line-clamp-2 font-display font-bold ${book.language === "bn" ? "font-bangla" : ""}`}>
                          {book.title}
                        </span>
                        <span className="mt-1 block truncate text-xs text-ink-mute">
                          {[book.author, book.language === "bn" ? "বাংলা" : "English"].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <PremiumBadge className="absolute right-2 top-2" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {(tab === "All" || tab === "Old Broadcasts") && broadcastRecordings.length > 0 && (
            <section>
              <SectionHeading title={t("searchPage.oldBroadcasts")} />
              <RecordedBroadcastTable recordings={tab === "All" ? broadcastRecordings.slice(0, 5) : broadcastRecordings} />
            </section>
          )}

          {(tab === "All" || tab === "Radio") && liveRadios.length > 0 && (
            <section>
              <SectionHeading title={t("searchPage.liveRadio")} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {liveRadios.map((r) => (
                  <Link
                    key={`live-${r.id}`}
                    href={`/live/${r.id}`}
                    className="flex items-center gap-3 rounded-card border border-edge bg-raised p-3 transition hover:bg-highlight"
                  >
                    <Artwork type="live_channel" id={r.id} url={r.artwork_url} title={displayTitle(r, locale)} className="size-12 shrink-0" rounded="rounded-full" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{displayTitle(r, locale)}</span>
                      <span className="block truncate text-xs text-ink-mute">{r.station || "Bangladesh Betar"}</span>
                    </span>
                    {r.is_live && (
                      <span className="flex items-center gap-1 rounded-full bg-flag/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-flag">
                        <span className="size-1.5 animate-pulse rounded-full bg-flag" /> Live
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
