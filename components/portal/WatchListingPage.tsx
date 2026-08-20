"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowLeft, ArrowRight, CirclePlay, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useWatchShows } from "@/lib/hooks";
import type { WatchShow } from "@/lib/types";

interface WatchListingPageProps {
  title: string;
  description: string;
  categorySlug: string;
  showHomeLink?: boolean;
}

function ShowCard({ show }: { show: WatchShow }) {
  return (
    <Link href={`/watch/${show.slug}`} className="group block min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-card bg-sunken shadow-xl shadow-shade/15">
        {show.image_url ? <img src={show.image_url} alt="" loading="lazy" className="editorial-image size-full object-cover" /> : <div className="grid size-full place-items-center text-ink-mute"><CirclePlay className="size-10" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white text-black shadow-lg transition group-hover:scale-105"><CirclePlay className="size-5" /></span>
      </div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{show.eyebrow ?? show.category}</p>
      <h2 className="mt-1 clamp-1 font-display text-xl font-bold tracking-tight group-hover:underline">{show.title}</h2>
      <p className="mt-1 clamp-2 text-sm leading-relaxed text-ink-mute">{show.description}</p>
      <p className="mt-2 text-xs font-bold text-ink-mute">{show.year ?? "New"} · {show.rating ?? "Not rated"} · {show.episodes_count ?? show.episodes.length} episodes</p>
    </Link>
  );
}

export default function WatchListingPage({ title, description, categorySlug, showHomeLink = true }: WatchListingPageProps) {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useWatchShows({ category: categorySlug, page, perPage: 12 });
  const shows = data?.data ?? [];
  const currentPage = data?.meta?.current_page ?? page;
  const lastPage = data?.meta?.last_page ?? currentPage;

  return (
    <div className="mx-auto w-full max-w-[1540px] px-4 pb-20 pt-8 sm:px-7 sm:pt-12 lg:px-10">
      <div className="border-b border-edge pb-8 sm:flex sm:items-end sm:justify-between sm:gap-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--portal-color)]">Betar Watch</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">{description}</p>
        </div>
        {showHomeLink && <Link href="/watch" className="mt-5 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-edge px-5 text-sm font-bold text-ink-soft transition hover:bg-highlight hover:text-ink sm:mt-0"><ArrowLeft className="size-4" /> Watch home</Link>}
      </div>

      {isLoading ? (
        <div className="grid min-h-[24rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /> Loading shows…</div></div>
      ) : error ? (
        <div className="grid min-h-[24rem] place-items-center text-center"><div><AlertCircle className="mx-auto size-9 text-danger" /><h2 className="mt-4 font-display text-2xl font-bold">This section could not be loaded</h2><p className="mt-2 text-sm text-ink-soft">Please try again shortly.</p></div></div>
      ) : shows.length === 0 ? (
        <div className="grid min-h-[22rem] place-items-center rounded-panel border border-dashed border-edge bg-raised px-6 text-center"><div><CirclePlay className="mx-auto size-10 text-ink-mute" /><h2 className="mt-4 font-display text-2xl font-bold">No published shows yet</h2><p className="mt-2 text-sm text-ink-soft">Shows assigned to this category in the admin portal will appear here automatically.</p></div></div>
      ) : (
        <div className="mt-9 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shows.map((show) => <ShowCard key={show.id} show={show} />)}
        </div>
      )}

      {lastPage > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Watch pagination">
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edge px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="size-4" /> Previous</button>
          <span className="px-2 text-sm font-bold text-ink-mute">Page {currentPage} of {lastPage}</span>
          <button type="button" disabled={currentPage >= lastPage} onClick={() => setPage((value) => Math.min(lastPage, value + 1))} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edge px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">Next <ArrowRight className="size-4" /></button>
        </nav>
      )}
    </div>
  );
}
