"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowLeft, ArrowRight, CalendarDays, CirclePlay, Clock3, Film, Layers3, LoaderCircle, Play, Radio, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import AdvancedVideoPlayer from "@/components/player/AdvancedVideoPlayer";
import ContentActions from "@/components/engagement/ContentActions";
import { useApi, useWatchShow } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { Paginated, WatchEpisode, WatchShow } from "@/lib/types";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

function categorySlug(category: string): string {
  return category.toLowerCase().replaceAll(" ", "-");
}

function RelatedShowCard({ show }: { show: WatchShow }) {
  const { locale, t } = useTranslation();
  const category = localizedText(show as unknown as Record<string, unknown>, "category", locale);
  const title = localizedText(show as unknown as Record<string, unknown>, "title", locale);
  const description = localizedText(show as unknown as Record<string, unknown>, "description", locale);
  const eyebrow = localizedText(show as unknown as Record<string, unknown>, "eyebrow", locale) || category;

  return (
    <Link href={`/watch/${show.slug}`} className="group flex flex-col overflow-hidden rounded-panel border border-edge bg-raised transition hover:border-[var(--portal-color)]/40 hover:shadow-lg hover:shadow-shade/10">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-sunken">
        {show.image_url ? (
          <img
            src={show.image_url}
            alt=""
            loading="lazy"
            className="editorial-image size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-ink-mute">
            <Film className="size-10" />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* Play button */}
        <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-[var(--portal-color)] text-[var(--portal-on-color)] shadow-xl transition-transform group-hover:scale-110">
          <Play className="ml-0.5 size-4 fill-current" />
        </span>
        {/* Rating badge */}
        {show.rating && (
          <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
            {show.rating}
          </span>
        )}
        {/* Episodes count */}
        <span className="absolute left-3 bottom-3 flex items-center gap-1 text-[10px] font-black text-white/90">
          <Layers3 className="size-3" /> {t("common.episodes", { count: show.episodes_count ?? show.episodes?.length ?? 0 })}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">
          {eyebrow}
        </p>
        <h3 className="font-display text-base font-bold leading-snug group-hover:underline">
          {title}
        </h3>
        <p className="clamp-2 text-xs leading-relaxed text-ink-mute">
          {description}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2 text-[11px] font-bold text-ink-mute">
          {show.year && <span className="flex items-center gap-1"><Star className="size-3 text-amber-500" />{show.year}</span>}
          <span className="text-ink-mute/60">·</span>
          <span>{category}</span>
        </div>
      </div>
    </Link>
  );
}

export default function WatchShowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { locale, t } = useTranslation();
  const { slug } = use(params);
  const { data, error, isLoading, mutate } = useWatchShow(slug);
  const token = useAuth((state) => state.token);
  const isPremium = useAuth((state) => state.entitlements?.is_premium ?? false);
  const openLoginPrompt = useUi((state) => state.openLoginPrompt);
  const openUpgradePrompt = useUi((state) => state.openUpgradePrompt);
  const toast = useUi((state) => state.toast);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const show = data?.data;

  // Fetch same-category shows plus all shows for a broad pool
  const relatedPath = show ? `/watch?category=${encodeURIComponent(show.category_slug || categorySlug(show.category))}&per_page=8` : null;
  const { data: relatedResponse } = useApi<Paginated<WatchShow>>(relatedPath);
  const { data: allShowsResponse } = useApi<Paginated<WatchShow>>("/watch?per_page=20");

  // Build related: same category first, then fill with other shows to reach at least 4
  const sameCat = (relatedResponse?.data ?? []).filter((item) => item.id !== show?.id);
  const allOthers = (allShowsResponse?.data ?? []).filter(
    (item) => item.id !== show?.id && !sameCat.some((s) => s.id === item.id),
  );
  const related = [...sameCat, ...allOthers].slice(0, 8);

  if (isLoading) return <div className="grid min-h-[32rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-6 animate-spin text-[var(--portal-color)]" /> {t("watch.showLoading")}</div></div>;
  if (error || !show) {
    return <div className="mx-auto grid min-h-[32rem] max-w-xl place-items-center px-5 text-center"><div><AlertCircle className="mx-auto size-9 text-[var(--portal-color)]" /><h1 className="mt-4 font-display text-3xl font-bold">{t("watch.showUnavailable")}</h1><p className="mt-2 text-sm text-ink-soft">{t("watch.showUnavailableDescription")}</p><Link href="/watch" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-page"><ArrowLeft className="size-4" /> {t("watch.backToWatch")}</Link></div></div>;
  }

  const title = localizedText(show as unknown as Record<string, unknown>, "title", locale);
  const description = localizedText(show as unknown as Record<string, unknown>, "description", locale);
  const category = localizedText(show as unknown as Record<string, unknown>, "category", locale);
  const eyebrow = localizedText(show as unknown as Record<string, unknown>, "eyebrow", locale) || category;

  const firstPlayable = show.episodes.find((episode) => episode.has_video);
  const currentEpisode = show.episodes.find((episode) => episode.id === selectedEpisodeId) ?? firstPlayable ?? show.episodes[0];
  const totalMinutes = show.episodes.reduce((total, episode) => total + episode.duration_minutes, 0);

  const openEpisode = async (episode: WatchEpisode, shouldPlay: boolean) => {
    setSelectedEpisodeId(episode.id);
    setAutoPlay(false);
    window.requestAnimationFrame(() => document.getElementById("watch-player")?.scrollIntoView({ behavior: "smooth", block: "center" }));

    if (!shouldPlay || !episode.has_video) return;
    if (!token) {
      openLoginPrompt(t("watch.signInToWatch"));
      return;
    }
    if (!isPremium) {
      openUpgradePrompt({ title: t("watch.premiumPlaybackTitle"), body: t("watch.premiumPlaybackDescription") });
      return;
    }

    if (episode.video_url) {
      setAutoPlay(true);
      return;
    }

    const refreshed = await mutate();
    const refreshedEpisode = refreshed?.data.episodes.find((item) => item.id === episode.id);
    if (refreshedEpisode?.video_url) {
      setAutoPlay(true);
    } else {
      toast(t("watch.videoPreparing"), "info");
    }
  };

  return (
    <div className="pb-24">
      <section className="relative min-h-[34rem] overflow-hidden bg-black text-white sm:min-h-[42rem] lg:min-h-[46rem]">
        {show.image_url ? <img src={show.image_url} alt="" className="absolute inset-0 size-full object-cover object-center" /> : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
        <div className="absolute -bottom-32 right-[8%] size-96 rounded-full bg-[var(--portal-color)] opacity-15 blur-3xl" />
        <div className="relative mx-auto flex min-h-[34rem] max-w-[1540px] flex-col justify-between px-4 py-8 sm:min-h-[42rem] sm:px-8 sm:py-10 lg:min-h-[46rem] lg:px-12">
          <nav className="flex items-center gap-2 text-xs font-bold text-white/60" aria-label="Breadcrumb"><Link href="/watch" className="hover:text-white">{t("common.watch")}</Link><span>/</span><Link href={`/watch/category/${show.category_slug || categorySlug(show.category)}`} className="text-[#75e3df] hover:underline">{category}</Link></nav>
          <div className="max-w-3xl pb-6">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#75e3df]"><Sparkles className="size-4" /> {eyebrow}</p>
            <h1 className="mt-4 text-balance font-display text-5xl font-bold leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-8xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-xl">{description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {firstPlayable ? (
                <button type="button" onClick={() => void openEpisode(firstPlayable, true)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black shadow-xl transition hover:scale-[1.02]"><Play className="size-5 fill-current" /> {t("watch.watchEpisode", { number: firstPlayable.position })}</button>
              ) : (
                <a href="#episodes" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black"><Layers3 className="size-5" /> {t("watch.browseEpisodes")}</a>
              )}
              <ContentActions type="watch_show" id={show.id} title={title} text={description} tone="on-dark" />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-bold text-white/60">
              <span className="rounded-full border border-white/20 px-3 py-1.5 text-white">{show.rating ?? t("common.notRated")}</span><span>{show.year ?? t("watch.newRelease")}</span><span>·</span><span>{category}</span><span>·</span><span>{t("common.episodes", { count: show.episodes.length })}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1540px] px-4 pt-10 sm:px-7 sm:pt-14 lg:px-10">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Programme facts">
          {[
            { icon: Layers3, label: t("watch.episodesLabel"), value: String(show.episodes.length) },
            { icon: Clock3, label: t("watch.totalRuntime"), value: totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : t("watch.toBeAnnounced") },
            { icon: CalendarDays, label: t("watch.release"), value: show.year ? String(show.year) : t("common.new") },
            { icon: Film, label: t("watch.category"), value: category },
          ].map(({ icon: Icon, label, value }) => <div key={label} className="flex items-center gap-4 rounded-card border border-edge bg-raised p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--portal-color)_14%,transparent)] text-[var(--portal-color)]"><Icon className="size-4.5" /></span><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-ink-mute">{label}</p><p className="mt-0.5 font-display text-base font-bold">{value}</p></div></div>)}
        </section>

        {currentEpisode && (
          <section id="watch-player" className="mt-12 scroll-mt-24 overflow-hidden rounded-panel border border-edge bg-sunken shadow-2xl shadow-shade/25">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="relative aspect-video bg-black">
                {currentEpisode.video_url ? (
                  <AdvancedVideoPlayer key={`${currentEpisode.id}-${autoPlay}`} src={currentEpisode.video_url} title={`${title} — ${localizedText(currentEpisode as unknown as Record<string, unknown>, "title", locale)}`} poster={show.image_url} autoPlay={autoPlay} />
                ) : currentEpisode.has_video ? (
                  <button type="button" onClick={() => void openEpisode(currentEpisode, true)} className="group relative grid size-full place-items-center overflow-hidden text-white" aria-label={t("watch.playVideo")}>
                    {show.image_url && <img src={show.image_url} alt="" className="absolute inset-0 size-full object-cover opacity-55 transition duration-500 group-hover:scale-105" />}
                    <div className="absolute inset-0 bg-black/50 transition group-hover:bg-black/40" />
                    <span className="relative flex flex-col items-center"><span className="grid size-20 place-items-center rounded-full bg-white text-black shadow-2xl transition group-hover:scale-105"><Play className="ml-1 size-8 fill-current" /></span><span className="mt-4 text-sm font-black">{token ? t("watch.premiumToWatch") : t("watch.signInToWatchShort")}</span></span>
                  </button>
                ) : (
                  <div className="relative grid size-full place-items-center overflow-hidden">
                    {show.image_url && <img src={show.image_url} alt="" className="absolute inset-0 size-full object-cover opacity-45" />}
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="relative text-center"><Radio className="mx-auto size-10 text-white/70" /><p className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-white">{t("watch.videoComingSoon")}</p></div>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">Episode {currentEpisode.position}</p>
                <h2 className="mt-2 font-display text-3xl font-bold leading-tight">{localizedText(currentEpisode as unknown as Record<string, unknown>, "title", locale)}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{localizedText(currentEpisode as unknown as Record<string, unknown>, "description", locale) || t("watch.episodeFallback")}</p>
                <p className="mt-5 flex items-center gap-2 text-xs font-bold text-ink-mute"><Clock3 className="size-4" /> {currentEpisode.duration}</p>
                {currentEpisode.has_video && !autoPlay && <button type="button" onClick={() => void openEpisode(currentEpisode, true)} className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[var(--portal-color)] px-5 text-sm font-black text-[var(--portal-on-color)]"><CirclePlay className="size-5" /> {t("watch.startWatching")}</button>}
              </div>
            </div>
          </section>
        )}

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <section id="episodes" className="scroll-mt-24">
            <div className="flex items-end justify-between gap-4 border-b border-edge pb-5">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{t("watch.season")}</p><h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{t("watch.episodeGuide")}</h2></div>
              <span className="text-sm font-bold text-ink-mute">{t("common.episodes", { count: show.episodes.length })}</span>
            </div>
            {show.episodes.length === 0 ? (
              <div className="mt-6 rounded-panel border border-dashed border-edge bg-raised p-8 text-center"><Layers3 className="mx-auto size-9 text-ink-mute" /><h3 className="mt-3 font-display text-xl font-bold">{t("watch.episodesComingSoon")}</h3><p className="mt-2 text-sm text-ink-soft">{t("watch.episodesComingSoonDescription")}</p></div>
            ) : (
              <ol className="mt-2">
                {show.episodes.map((episode, index) => {
                  const active = currentEpisode?.id === episode.id;
                  return (
                    <li key={episode.id} className="border-b border-edge">
                      <button type="button" onClick={() => void openEpisode(episode, episode.has_video)} className={`group grid w-full gap-4 py-6 text-left transition sm:grid-cols-[3rem_12rem_minmax(0,1fr)_auto] sm:items-center ${active ? "text-ink" : "text-ink-soft hover:text-ink"}`}>
                        <span className={`hidden font-display text-2xl font-bold sm:block ${active ? "text-[var(--portal-color)]" : "text-ink-mute"}`}>{String(index + 1).padStart(2, "0")}</span>
                        <div className="relative aspect-video overflow-hidden rounded-card bg-sunken">
                          {show.image_url ? <img src={show.image_url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : null}
                          <span className={`absolute inset-0 grid place-items-center transition ${active ? "bg-black/20" : "bg-black/40 group-hover:bg-black/25"}`}><span className="grid size-10 place-items-center rounded-full bg-white text-black shadow-lg"><Play className="size-4 fill-current" /></span></span>
                        </div>
                        <div className="min-w-0"><div className="flex items-center gap-2"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{t("watch.episode", { number: episode.position })}</span>{episode.has_video && <span className="rounded-full bg-success/12 px-2 py-0.5 text-[9px] font-black uppercase text-success">{t("watch.watchNow")}</span>}</div><h3 className="mt-1 font-display text-xl font-bold">{localizedText(episode as unknown as Record<string, unknown>, "title", locale)}</h3><p className="mt-1 clamp-2 text-sm leading-relaxed text-ink-mute">{localizedText(episode as unknown as Record<string, unknown>, "description", locale)}</p></div>
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
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{t("watch.aboutProgramme")}</p>
              <h2 className="mt-3 font-display text-2xl font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{description}</p>
              <dl className="mt-6 divide-y divide-edge border-y border-edge text-sm">
                <div className="flex justify-between gap-4 py-3"><dt className="text-ink-mute">{t("watch.classification")}</dt><dd className="font-bold">{show.rating ?? t("common.notRated")}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-ink-mute">{t("watch.releaseYear")}</dt><dd className="font-bold">{show.year ?? t("common.new")}</dd></div>
                <div className="flex justify-between gap-4 py-3"><dt className="text-ink-mute">{t("watch.category")}</dt><dd className="font-bold">{category}</dd></div>
              </dl>
            </section>
            <section className="portal-tint-panel rounded-panel p-6">
              <Radio className="size-7 text-[var(--portal-color)]" />
              <h2 className="mt-4 font-display text-2xl font-bold">{t("watch.madeForEveryone")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("watch.madeForEveryoneDescription")}</p>
              <Link href="/watch/categories" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--portal-color)] hover:gap-3">{t("watch.browseWatch")} <ArrowRight className="size-4" /></Link>
            </section>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            {/* Section header */}
            <div className="mb-8 flex flex-col gap-4 border-t border-edge pt-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-[var(--portal-color)]" />
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">
                    {t("watch.moreLikeThis")}
                  </p>
                </div>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  {t("watch.similarProgrammes")}
                </h2>
                <p className="mt-1 text-sm text-ink-mute">{t("watch.similarProgrammesDescription")}</p>
              </div>
              <Link
                href="/watch"
                className="flex shrink-0 items-center gap-2 rounded-full border border-edge px-5 py-2.5 text-sm font-black text-ink-soft transition hover:border-[var(--portal-color)] hover:text-ink sm:w-auto"
              >
                {t("watch.browseAll")} <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Cards grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {related.map((item) => (
                <RelatedShowCard key={item.id} show={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
