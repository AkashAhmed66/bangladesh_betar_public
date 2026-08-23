"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowRight, CirclePlay, Info, LoaderCircle, Radio, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePortalCategories, useWatchLiveChannels, useWatchShows } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { WatchShow } from "@/lib/types";

function ShowCard({ show, rank }: { show: WatchShow; rank?: number }) {
  const { locale } = useTranslation();
  const title = localizedText(show as unknown as Record<string, unknown>, "title", locale);
  const description = localizedText(show as unknown as Record<string, unknown>, "description", locale);
  const category = localizedText(show as unknown as Record<string, unknown>, "category", locale);
  const eyebrow = localizedText(show as unknown as Record<string, unknown>, "eyebrow", locale) || category;
  return (
    <Link href={`/watch/${show.slug}`} className="group block min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-card bg-sunken shadow-xl shadow-shade/15">
        {show.image_url ? <img src={show.image_url} alt="" loading="lazy" className="editorial-image size-full object-cover" /> : <div className="grid size-full place-items-center text-ink-mute"><CirclePlay className="size-10" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        {rank && <span className="absolute -bottom-3 -left-1 font-display text-7xl font-black leading-none text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.8)]">{rank}</span>}
        <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white text-black opacity-100 shadow-lg transition sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"><CirclePlay className="size-5" /></span>
      </div>
      <div className={rank ? "pl-10" : ""}>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{eyebrow}</p>
        <h3 className="mt-1 clamp-1 font-display text-lg font-bold tracking-tight group-hover:underline">{title}</h3>
        <p className="mt-1 clamp-2 text-xs leading-relaxed text-ink-mute">{description}</p>
      </div>
    </Link>
  );
}

function Shelf({ id, title, shows, href, ranked = false }: { id: string; title: string; shows: WatchShow[]; href: string; ranked?: boolean }) {
  const { t } = useTranslation();
  if (shows.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-32">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="editorial-rule font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <Link href={href} className="hidden items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-ink-mute hover:text-ink sm:flex">{t("watch.viewAll")} <ArrowRight className="size-3.5" /></Link>
      </div>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-7 sm:px-7 [&::-webkit-scrollbar]:hidden">
        {shows.map((show, index) => <div key={show.slug} className="w-[78vw] max-w-[22rem] shrink-0 sm:w-[20rem] lg:w-[22rem]"><ShowCard show={show} rank={ranked ? index + 1 : undefined} /></div>)}
      </div>
    </section>
  );
}

function uniqueShows(shows: WatchShow[]): WatchShow[] {
  return Array.from(new Map(shows.map((show) => [show.id, show])).values());
}

export default function WatchPage() {
  const { locale, t } = useTranslation();
  const { data, error, isLoading } = useWatchShows();
  const { data: categoryResponse } = usePortalCategories();
  const { data: liveResponse } = useWatchLiveChannels();
  const shows = data?.data ?? [];
  const liveChannel = liveResponse?.data.find((channel) => channel.is_live) ?? liveResponse?.data[0];

  if (isLoading) return <div className="grid min-h-[30rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /> {t("watch.loadingPortal")}</div></div>;
  if (error || shows.length === 0) {
    return <div className="mx-auto grid min-h-[30rem] max-w-xl place-items-center px-5 text-center"><div><AlertCircle className="mx-auto size-9 text-[var(--portal-color)]" /><h1 className="mt-4 font-display text-3xl font-bold">{t("watch.unavailable")}</h1><p className="mt-2 text-sm text-ink-soft">{t("watch.unavailableDescription")}</p></div></div>;
  }

  const featured = shows.find((show) => show.is_featured) ?? shows[0];
  const docs = shows.filter((show) => show.category === "Documentary");
  const culture = shows.filter((show) => show.category === "Culture");
  const kids = shows.filter((show) => show.category === "Kids");
  const featuredTitle = localizedText(featured as unknown as Record<string, unknown>, "title", locale);
  const featuredDescription = localizedText(featured as unknown as Record<string, unknown>, "description", locale);
  const featuredCategory = localizedText(featured as unknown as Record<string, unknown>, "category", locale);
  const featuredEyebrow = localizedText(featured as unknown as Record<string, unknown>, "eyebrow", locale) || featuredCategory;
  const categories = (categoryResponse?.data.watch ?? []).filter((category) => category.slug !== "live-tv");

  return (
    <div className="w-full min-w-0 max-w-full pb-20">
      <section id="drama" className="relative min-h-[32rem] overflow-hidden bg-black text-white scroll-mt-32 sm:min-h-[38rem] lg:min-h-[43rem]">
        {featured.image_url ? <img src={featured.image_url} alt="" className="absolute inset-0 size-full object-cover object-center" /> : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/58 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/15" />
        <div className="relative mx-auto flex min-h-[32rem] max-w-[1540px] items-end px-4 pb-12 pt-24 sm:min-h-[38rem] sm:px-8 sm:pb-16 lg:min-h-[43rem] lg:px-12">
          <div className="min-w-0 max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#75e3df]"><Sparkles className="size-4" /> {featuredEyebrow}</p>
            <h1 className="mt-3 break-words font-display text-5xl font-bold leading-none tracking-[-0.055em] sm:text-7xl">{featuredTitle}</h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-lg">{featuredDescription}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/watch/${featured.slug}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black transition hover:scale-[1.02]"><CirclePlay className="size-5" /> {t("watch.watchNow")}</Link>
              <Link href={`/watch/${featured.slug}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-6 text-sm font-black text-white backdrop-blur transition hover:bg-white/25"><Info className="size-5" /> {t("watch.moreInfo")}</Link>
            </div>
            <p className="mt-5 text-xs font-bold text-white/55">{featured.year ?? t("common.new")} · {featured.rating ?? t("common.notRated")} · {featuredCategory} · {t("common.episodes", { count: featured.episodes_count ?? featured.episodes.length })}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-14 px-4 pt-10 sm:px-7 sm:pt-12 lg:px-10">
        <section id="live" className="watch-live-promo group relative overflow-hidden rounded-panel border scroll-mt-32">
          {liveChannel?.artwork_url && <img src={liveChannel.artwork_url} alt="" className="watch-live-promo-image absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.02]" />}
          <div className="watch-live-promo-overlay absolute inset-0" />
          <div className="relative grid min-h-52 items-center gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr_auto]">
            <span className="watch-live-promo-icon grid size-16 place-items-center rounded-full border"><Radio className="size-7" /></span>
            <div><p className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] ${liveChannel?.is_live ? "text-rose-500" : "watch-live-promo-accent"}`}><span className={`size-2 rounded-full ${liveChannel?.is_live ? "animate-pulse bg-rose-500" : "watch-live-promo-dot"}`} /> {liveChannel?.is_live ? t("watch.liveNow") : t("watch.watchLive")}</p><h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{liveChannel?.session_title ?? (liveChannel ? localizedText(liveChannel as unknown as Record<string, unknown>, "title", locale) : "Bangladesh Betar live television")}</h2><p className="watch-live-promo-muted mt-2 max-w-2xl text-sm leading-relaxed">{liveChannel?.description ?? "See national events, studio programmes and special Bangladesh Betar coverage as it happens."}</p></div>
            <Link href={liveChannel ? `/watch/live/${liveChannel.id}` : "/watch/live"} className="watch-live-promo-action inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition hover:scale-[1.02]"><CirclePlay className="size-4" /> {liveChannel?.is_live ? t("watch.watchNow") : t("watch.viewChannels")}</Link>
          </div>
        </section>

        <Shelf id="trending" title={t("watch.trending")} shows={shows.slice(0, 6)} href="/watch/categories" ranked />
        <Shelf id="documentary" title={t("watch.documentaries")} shows={uniqueShows([...docs, ...shows.slice(0, 2)])} href="/watch/category/documentary" />
        <Shelf id="culture" title={t("watch.cultureShelf")} shows={uniqueShows([...culture, ...shows.filter((show) => show.category === "Drama").slice(0, 2)])} href="/watch/category/culture" />
        <Shelf id="kids" title={t("watch.kidsShelf")} shows={uniqueShows([...kids, ...shows.slice(0, 2)])} href="/watch/category/kids" />

        <section id="categories" className="scroll-mt-32">
          <h2 className="editorial-rule font-display text-2xl font-bold sm:text-3xl">{t("watch.browseCategories")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category, index) => (
              <Link key={category.slug} href={`/watch/category/${category.slug}`} className="group relative min-h-32 overflow-hidden rounded-panel p-5 text-white" style={{ background: ["#7c2846", "#146b62", "#8a4a16", "#315fa8", "#6552a5"][index % 5] }}><span className="absolute -bottom-10 -right-8 size-28 rounded-full border-[16px] border-white/10 transition group-hover:scale-125" /><span className="relative font-display text-xl font-bold">{localizedText(category as unknown as Record<string, unknown>, "label", locale)}</span></Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
