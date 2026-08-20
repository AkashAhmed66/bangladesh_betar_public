"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowLeft, ArrowRight, CalendarDays, Check, CirclePlay, Clock3, Film, Layers3, LoaderCircle, Play, Radio, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import AdvancedVideoPlayer from "@/components/player/AdvancedVideoPlayer";
import { useApi, useWatchShow } from "@/lib/hooks";
import type { Paginated, WatchEpisode, WatchShow } from "@/lib/types";

function categorySlug(category: string): string {
  return category.toLowerCase().replaceAll(" ", "-");
}

function RelatedShow({ show }: { show: WatchShow }) {
  return (
    <Link href={`/watch/${show.slug}`} className="group block min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-card bg-sunken">
        {show.image_url ? <img src={show.image_url} alt="" loading="lazy" className="editorial-image size-full object-cover" /> : <div className="grid size-full place-items-center text-ink-mute"><Film className="size-9" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white text-black shadow-xl transition group-hover:scale-105"><Play className="size-4 fill-current" /></span>
      </div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{show.eyebrow ?? show.category}</p>
      <h3 className="mt-1 font-display text-xl font-bold group-hover:underline">{show.title}</h3>
      <p className="mt-1 clamp-2 text-sm leading-relaxed text-ink-mute">{show.description}</p>
    </Link>
  );
}

export default function WatchShowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, error, isLoading } = useWatchShow(slug);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [shared, setShared] = useState(false);
  const show = data?.data;
  const relatedPath = show ? `/watch?category=${encodeURIComponent(categorySlug(show.category))}&per_page=5` : null;
  const { data: relatedResponse } = useApi<Paginated<WatchShow>>(relatedPath);
  const related = (relatedResponse?.data ?? []).filter((item) => item.id !== show?.id).slice(0, 4);

  if (isLoading) return <div className="grid min-h-[32rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-6 animate-spin text-[var(--portal-color)]" /> Preparing the programme…</div></div>;
  if (error || !show) {
    return <div className="mx-auto grid min-h-[32rem] max-w-xl place-items-center px-5 text-center"><div><AlertCircle className="mx-auto size-9 text-[var(--portal-color)]" /><h1 className="mt-4 font-display text-3xl font-bold">Show not available</h1><p className="mt-2 text-sm text-ink-soft">This show may be unpublished or no longer available.</p><Link href="/watch" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-page"><ArrowLeft className="size-4" /> Back to Watch</Link></div></div>;
  }

  const firstPlayable = show.episodes.find((episode) => episode.video_url);
  const currentEpisode = show.episodes.find((episode) => episode.id === selectedEpisodeId) ?? firstPlayable ?? show.episodes[0];
  const totalMinutes = show.episodes.reduce((total, episode) => total + episode.duration_minutes, 0);

  const openEpisode = (episode: WatchEpisode, shouldPlay: boolean) => {
    setSelectedEpisodeId(episode.id);
    setAutoPlay(shouldPlay && Boolean(episode.video_url));
    window.requestAnimationFrame(() => document.getElementById("watch-player")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const share = async () => {
    const payload = { title: show.title, text: show.description, url: window.location.href };
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setShared(true);
    window.setTimeout(() => setShared(false), 2200);
  };

  return (
    <div className="pb-24">
      <section className="relative min-h-[34rem] overflow-hidden bg-black text-white sm:min-h-[42rem] lg:min-h-[46rem]">
        {show.image_url ? <img src={show.image_url} alt="" className="absolute inset-0 size-full object-cover object-center" /> : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
        <div className="absolute -bottom-32 right-[8%] size-96 rounded-full bg-[var(--portal-color)] opacity-15 blur-3xl" />
        <div className="relative mx-auto flex min-h-[34rem] max-w-[1540px] flex-col justify-between px-4 py-8 sm:min-h-[42rem] sm:px-8 sm:py-10 lg:min-h-[46rem] lg:px-12">
          <nav className="flex items-center gap-2 text-xs font-bold text-white/60" aria-label="Breadcrumb"><Link href="/watch" className="hover:text-white">Watch</Link><span>/</span><Link href={`/watch/category/${categorySlug(show.category)}`} className="text-[#75e3df] hover:underline">{show.category}</Link></nav>
          <div className="max-w-3xl pb-6">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#75e3df]"><Sparkles className="size-4" /> {show.eyebrow ?? show.category}</p>
            <h1 className="mt-4 text-balance font-display text-5xl font-bold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">{show.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-xl">{show.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {firstPlayable ? (
                <button type="button" onClick={() => openEpisode(firstPlayable, true)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black shadow-xl transition hover:scale-[1.02]"><Play className="size-5 fill-current" /> Watch episode {firstPlayable.position}</button>
              ) : (
                <a href="#episodes" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black"><Layers3 className="size-5" /> Browse episodes</a>
              )}
              <button type="button" onClick={() => void share()} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/12 px-5 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/20">{shared ? <Check className="size-5 text-[#75e3df]" /> : <Share2 className="size-5" />} {shared ? "Copied" : "Share"}</button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-bold text-white/60">
              <span className="rounded-full border border-white/20 px-3 py-1.5 text-white">{show.rating ?? "Not rated"}</span><span>{show.year ?? "New release"}</span><span>·</span><span>{show.category}</span><span>·</span><span>{show.episodes.length} episodes</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1540px] px-4 pt-10 sm:px-7 sm:pt-14 lg:px-10">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Programme facts">
          {[
            { icon: Layers3, label: "Episodes", value: String(show.episodes.length) },
            { icon: Clock3, label: "Total runtime", value: totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : "To be announced" },
            { icon: CalendarDays, label: "Release", value: show.year ? String(show.year) : "New" },
            { icon: Film, label: "Category", value: show.category },
          ].map(({ icon: Icon, label, value }) => <div key={label} className="flex items-center gap-4 rounded-card border border-edge bg-raised p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--portal-color)_14%,transparent)] text-[var(--portal-color)]"><Icon className="size-4.5" /></span><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-ink-mute">{label}</p><p className="mt-0.5 font-display text-base font-bold">{value}</p></div></div>)}
        </section>

        {currentEpisode && (
          <section id="watch-player" className="mt-12 scroll-mt-24 overflow-hidden rounded-panel border border-edge bg-sunken shadow-2xl shadow-shade/25">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="relative aspect-video bg-black">
                {currentEpisode.video_url ? (
                  <AdvancedVideoPlayer key={`${currentEpisode.id}-${autoPlay}`} src={currentEpisode.video_url} title={`${show.title} — ${currentEpisode.title}`} poster={show.image_url} autoPlay={autoPlay} />
                ) : (
                  <div className="relative grid size-full place-items-center overflow-hidden">
                    {show.image_url && <img src={show.image_url} alt="" className="absolute inset-0 size-full object-cover opacity-45" />}
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="relative text-center"><Radio className="mx-auto size-10 text-white/70" /><p className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-white">Video coming soon</p></div>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">Episode {currentEpisode.position}</p>
                <h2 className="mt-2 font-display text-3xl font-bold leading-tight">{currentEpisode.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{currentEpisode.description ?? "Episode information will be added by the programme team."}</p>
                <p className="mt-5 flex items-center gap-2 text-xs font-bold text-ink-mute"><Clock3 className="size-4" /> {currentEpisode.duration}</p>
                {currentEpisode.video_url && !autoPlay && <button type="button" onClick={() => setAutoPlay(true)} className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[var(--portal-color)] px-5 text-sm font-black text-[var(--portal-on-color)]"><CirclePlay className="size-5" /> Start watching</button>}
              </div>
            </div>
          </section>
        )}

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <section id="episodes" className="scroll-mt-24">
            <div className="flex items-end justify-between gap-4 border-b border-edge pb-5">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">Season 1</p><h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Episode guide</h2></div>
              <span className="text-sm font-bold text-ink-mute">{show.episodes.length} episodes</span>
            </div>
            {show.episodes.length === 0 ? (
              <div className="mt-6 rounded-panel border border-dashed border-edge bg-raised p-8 text-center"><Layers3 className="mx-auto size-9 text-ink-mute" /><h3 className="mt-3 font-display text-xl font-bold">Episodes coming soon</h3><p className="mt-2 text-sm text-ink-soft">The programme team has not published an episode yet.</p></div>
            ) : (
              <ol className="mt-2">
                {show.episodes.map((episode, index) => {
                  const active = currentEpisode?.id === episode.id;
                  return (
                    <li key={episode.id} className="border-b border-edge">
                      <button type="button" onClick={() => openEpisode(episode, Boolean(episode.video_url))} className={`group grid w-full gap-4 py-6 text-left transition sm:grid-cols-[3rem_12rem_minmax(0,1fr)_auto] sm:items-center ${active ? "text-ink" : "text-ink-soft hover:text-ink"}`}>
                        <span className={`hidden font-display text-2xl font-bold sm:block ${active ? "text-[var(--portal-color)]" : "text-ink-mute"}`}>{String(index + 1).padStart(2, "0")}</span>
                        <div className="relative aspect-video overflow-hidden rounded-card bg-sunken">
                          {show.image_url ? <img src={show.image_url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : null}
                          <span className={`absolute inset-0 grid place-items-center transition ${active ? "bg-black/20" : "bg-black/40 group-hover:bg-black/25"}`}><span className="grid size-10 place-items-center rounded-full bg-white text-black shadow-lg"><Play className="size-4 fill-current" /></span></span>
                        </div>
                        <div className="min-w-0"><div className="flex items-center gap-2"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">Episode {episode.position}</span>{episode.video_url && <span className="rounded-full bg-success/12 px-2 py-0.5 text-[9px] font-black uppercase text-success">Watch now</span>}</div><h3 className="mt-1 font-display text-xl font-bold">{episode.title}</h3><p className="mt-1 clamp-2 text-sm leading-relaxed text-ink-mute">{episode.description}</p></div>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-ink-mute"><Clock3 className="size-3.5" /> {episode.duration}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <aside className="space-y-7 lg:sticky lg:top-5">
            <section className="rounded-panel border border-edge bg-raised p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">About the programme</p>
              <h2 className="mt-3 font-display text-2xl font-bold">{show.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{show.description}</p>
              <dl className="mt-6 divide-y divide-edge border-y border-edge text-sm">
                <div className="flex justify-between gap-4 py-3"><dt className="text-ink-mute">Classification</dt><dd className="font-bold">{show.rating ?? "Not rated"}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-ink-mute">Release year</dt><dd className="font-bold">{show.year ?? "New"}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-ink-mute">Category</dt><dd className="font-bold">{show.category}</dd></div>
              </dl>
            </section>
            <section className="portal-tint-panel rounded-panel p-6">
              <Radio className="size-7 text-[var(--portal-color)]" />
              <h2 className="mt-4 font-display text-2xl font-bold">Made for everyone</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Original public-service stories, documentaries and performances from Bangladesh Betar.</p>
              <Link href="/watch/categories" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--portal-color)] hover:gap-3">Browse Watch <ArrowRight className="size-4" /></Link>
            </section>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-edge pt-10">
            <div className="flex items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">Because you watched</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">More in {show.category}</h2></div><Link href={`/watch/category/${categorySlug(show.category)}`} className="hidden items-center gap-2 text-sm font-black text-ink-soft hover:text-ink sm:flex">View all <ArrowRight className="size-4" /></Link></div>
            <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <RelatedShow key={item.id} show={item} />)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
