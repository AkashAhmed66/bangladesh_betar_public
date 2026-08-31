"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowRight, CirclePlay, LoaderCircle, Radio } from "lucide-react";
import Link from "next/link";
import { usePortalCategories, useWatchLiveChannels, useWatchShows } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { WatchShow } from "@/lib/types";
import WatchHeroSlider from "@/components/watch/WatchHeroSlider";

function ShowCard({ show, rank }: { show: WatchShow; rank?: number }) {
  const { locale, t } = useTranslation();
  const title = localizedText(show as unknown as Record<string, unknown>, "title", locale);
  const description = localizedText(show as unknown as Record<string, unknown>, "description", locale);
  const category = localizedText(show as unknown as Record<string, unknown>, "category", locale);
  const eyebrow = localizedText(show as unknown as Record<string, unknown>, "eyebrow", locale) || category;

  return (
    <Link href={`/watch/${show.slug}`} className="group block min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-card bg-sunken shadow-xl shadow-shade/15">
        {show.image_url ? (
          <img src={show.image_url} alt="" loading="lazy" className="editorial-image size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center text-ink-mute">
            <CirclePlay className="size-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {rank && (
          <span className="absolute -bottom-3 -left-1 font-display text-7xl font-black leading-none text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]">
            {rank}
          </span>
        )}
        <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white text-black opacity-100 shadow-lg transition sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <CirclePlay className="size-5" />
        </span>
      </div>
      <div className={rank ? "pl-10" : ""}>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--portal-color,#e50914)]">
          {eyebrow}
        </p>
        <h3 className="mt-1 clamp-1 font-display text-lg font-bold tracking-tight text-ink group-hover:underline">
          {title}
        </h3>
        <p className="mt-1 clamp-2 text-xs leading-relaxed text-ink-mute">
          {description}
        </p>
        <p className="mt-1.5 text-[11px] font-bold text-ink-soft">
          {show.year ?? "2026"} · {show.rating ?? "G"} · {t("common.episodes", { count: show.episodes_count ?? show.episodes.length })}
        </p>
      </div>
    </Link>
  );
}

function Shelf({
  id,
  title,
  shows,
  href,
  ranked = false,
}: {
  id: string;
  title: string;
  shows: WatchShow[];
  href: string;
  ranked?: boolean;
}) {
  const { t } = useTranslation();
  if (shows.length === 0) return null;

  return (
    <section id={id} className="scroll-mt-32">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="editorial-rule font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
        <Link
          href={href}
          className="hidden items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-ink-mute transition hover:text-ink sm:flex"
        >
          {t("watch.viewAll")} <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-7 sm:px-7 [&::-webkit-scrollbar]:hidden">
        {shows.map((show, index) => (
          <div key={show.slug} className="w-[78vw] max-w-[22rem] shrink-0 sm:w-[20rem] lg:w-[22rem]">
            <ShowCard show={show} rank={ranked ? index + 1 : undefined} />
          </div>
        ))}
      </div>
    </section>
  );
}

function uniqueShows(shows: WatchShow[]): WatchShow[] {
  return Array.from(new Map(shows.map((show) => [show.id, show])).values());
}

export default function WatchPage() {
  const { locale, t } = useTranslation();
  const { data, error, isLoading } = useWatchShows({ perPage: 40 });
  const { data: categoryResponse } = usePortalCategories();
  const { data: liveResponse } = useWatchLiveChannels();

  const shows = data?.data ?? [];
  const liveChannel = liveResponse?.data.find((channel) => channel.is_live) ?? liveResponse?.data[0];

  if (isLoading) {
    return (
      <div className="grid min-h-[30rem] place-items-center">
        <div className="flex items-center gap-3 text-sm font-bold text-ink-soft">
          <LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" />
          {t("watch.loadingPortal")}
        </div>
      </div>
    );
  }

  if (error || shows.length === 0) {
    return (
      <div className="mx-auto grid min-h-[30rem] max-w-xl place-items-center px-5 text-center">
        <div>
          <AlertCircle className="mx-auto size-9 text-[var(--portal-color)]" />
          <h1 className="mt-4 font-display text-3xl font-bold">{t("watch.unavailable")}</h1>
          <p className="mt-2 text-sm text-ink-soft">{t("watch.unavailableDescription")}</p>
        </div>
      </div>
    );
  }

  // Top featured shows for Hero Carousel
  const featuredShows = shows.filter((s) => s.is_featured);
  const heroSliderShows = featuredShows.length >= 2 ? featuredShows : shows.slice(0, 6);

  // Exact 9 requested sections in serial order:
  // 1. new release
  // 2. tranding (Trending)
  // 3. documentaries
  // 4. popular programmes
  // 5. comedy
  // 6. living and culture
  // 7. horror
  // 8. new and current affires (News and Current Affairs)
  // 9. crime drama

  const newReleaseShows = uniqueShows([
    ...shows.filter((s) => s.category === "New Release" || (s.year && s.year >= 2026)),
    ...shows.slice(0, 4),
  ]);

  const trendingShows = shows.slice(0, 8);

  const documentaryShows = uniqueShows([
    ...shows.filter((s) => s.category === "Documentary"),
    ...shows.filter((s) => s.category === "Short Films"),
  ]);

  const popularProgrammesShows = uniqueShows([
    ...shows.filter((s) => s.category === "Popular Programmes"),
    ...shows.filter((s) => s.category === "Kids"),
    ...shows.filter((s) => s.category === "Drama").slice(0, 2),
  ]);

  const comedyShows = uniqueShows([
    ...shows.filter((s) => s.category === "Comedy"),
    ...shows.filter((s) => s.slug.includes("koutuk") || s.slug.includes("golpo")),
    ...shows.filter((s) => s.category === "Kids"),
  ]);

  const livingAndCultureShows = uniqueShows([
    ...shows.filter((s) => s.category === "Living and Culture" || s.category === "Culture"),
    ...shows.filter((s) => s.category === "Songs"),
  ]);

  const horrorShows = uniqueShows([
    ...shows.filter((s) => s.category === "Horror"),
    ...shows.filter((s) => s.slug.includes("bhoot") || s.slug.includes("chhaya") || s.slug.includes("pretopuri")),
    ...shows.filter((s) => s.category === "Crime Drama"),
  ]);

  const newsAndCurrentAffairsShows = uniqueShows([
    ...shows.filter((s) => s.category === "News and Current Affairs"),
    ...shows.filter((s) => s.slug.includes("betar-shongbad") || s.slug.includes("mukhomukhi")),
    ...shows.filter((s) => s.category === "Documentary"),
  ]);

  const crimeDramaShows = uniqueShows([
    ...shows.filter((s) => s.category === "Crime Drama"),
    ...shows.filter((s) => s.category === "Drama"),
    ...shows.filter((s) => s.category === "Series"),
  ]);

  const categories = (categoryResponse?.data.watch ?? []).filter((category) => category.slug !== "live-tv");

  return (
    <div className="w-full min-w-0 max-w-full pb-20">
      {/* 1. Hero Auto & Manual Slider */}
      <WatchHeroSlider shows={heroSliderShows} />

      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-14 px-4 pt-10 sm:px-7 sm:pt-12 lg:px-10">
        {/* Live TV Promotion banner */}
        <section id="live" className="watch-live-promo group relative overflow-hidden rounded-panel border scroll-mt-32">
          {liveChannel?.artwork_url && (
            <img
              src={liveChannel.artwork_url}
              alt=""
              className="watch-live-promo-image absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.02]"
            />
          )}
          <div className="watch-live-promo-overlay absolute inset-0" />
          <div className="relative grid min-h-52 items-center gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr_auto]">
            <span className="watch-live-promo-icon grid size-16 place-items-center rounded-full border">
              <Radio className="size-7" />
            </span>
            <div>
              <p
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] ${
                  liveChannel?.is_live ? "text-rose-500" : "watch-live-promo-accent"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    liveChannel?.is_live ? "animate-pulse bg-rose-500" : "watch-live-promo-dot"
                  }`}
                />
                {liveChannel?.is_live ? t("watch.liveNow") : t("watch.watchLive")}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl text-ink">
                {liveChannel?.session_title ??
                  (liveChannel
                    ? localizedText(liveChannel as unknown as Record<string, unknown>, "title", locale)
                    : "Bangladesh Betar Live Television")}
              </h2>
              <p className="watch-live-promo-muted mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                {liveChannel?.description ??
                  "See national events, studio programmes and special Bangladesh Betar coverage as it happens."}
              </p>
            </div>
            <Link
              href={liveChannel ? `/watch/live/${liveChannel.id}` : "/watch/live"}
              className="watch-live-promo-action inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition hover:scale-[1.02]"
            >
              <CirclePlay className="size-4" /> {liveChannel?.is_live ? t("watch.watchNow") : t("watch.viewChannels")}
            </Link>
          </div>
        </section>

        {/* 9 Requested Shelves in Exact Serial Sequence: */}

        {/* 1. New Release */}
        <Shelf
          id="new-release"
          title={t("watch.newRelease", { defaultValue: "New Release" })}
          shows={newReleaseShows}
          href="/watch/category/new-release"
        />

        {/* 2. Trending */}
        <Shelf
          id="trending"
          title={t("watch.trending", { defaultValue: "Trending" })}
          shows={trendingShows}
          href="/watch/categories"
          ranked
        />

        {/* 3. Documentaries */}
        <Shelf
          id="documentaries"
          title={t("watch.documentaries", { defaultValue: "Documentaries" })}
          shows={documentaryShows}
          href="/watch/category/documentary"
        />

        {/* 4. Popular Programmes */}
        <Shelf
          id="popular-programmes"
          title={t("watch.popularProgrammes", { defaultValue: "Popular Programmes" })}
          shows={popularProgrammesShows}
          href="/watch/category/popular-programmes"
        />

        {/* 5. Comedy */}
        <Shelf
          id="comedy"
          title={t("watch.comedy", { defaultValue: "Comedy" })}
          shows={comedyShows}
          href="/watch/category/comedy"
        />

        {/* 6. Living and Culture */}
        <Shelf
          id="living-and-culture"
          title={t("watch.livingAndCulture", { defaultValue: "Living and Culture" })}
          shows={livingAndCultureShows}
          href="/watch/category/living-and-culture"
        />

        {/* 7. Horror */}
        <Shelf
          id="horror"
          title={t("watch.horror", { defaultValue: "Horror" })}
          shows={horrorShows}
          href="/watch/category/horror"
        />

        {/* 8. News and Current Affairs */}
        <Shelf
          id="news-and-current-affairs"
          title={t("watch.newsAndCurrentAffairs", { defaultValue: "News and Current Affairs" })}
          shows={newsAndCurrentAffairsShows}
          href="/watch/category/news-and-current-affairs"
        />

        {/* 9. Crime Drama */}
        <Shelf
          id="crime-drama"
          title={t("watch.crimeDrama", { defaultValue: "Crime Drama" })}
          shows={crimeDramaShows}
          href="/watch/category/crime-drama"
        />

        {/* Browse Categories Section */}
        <section id="categories" className="scroll-mt-32">
          <h2 className="editorial-rule font-display text-2xl font-bold text-ink sm:text-3xl">
            {t("watch.browseCategories")}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/watch/category/${category.slug}`}
                className="group relative min-h-28 overflow-hidden rounded-panel p-4 text-white shadow-sm transition hover:scale-[1.02] hover:shadow-md"
                style={{
                  background: [
                    "linear-gradient(135deg, #7c2846, #421020)",
                    "linear-gradient(135deg, #146b62, #083b35)",
                    "linear-gradient(135deg, #8a4a16, #4d2607)",
                    "linear-gradient(135deg, #315fa8, #18335c)",
                    "linear-gradient(135deg, #6552a5, #35265e)",
                    "linear-gradient(135deg, #b8324a, #5f1322)",
                    "linear-gradient(135deg, #0d7870, #043d39)",
                  ][index % 7],
                }}
              >
                <span className="absolute -bottom-8 -right-6 size-24 rounded-full border-[14px] border-white/10 transition group-hover:scale-125" />
                <span className="relative font-display text-base font-bold sm:text-lg">
                  {localizedText(category as unknown as Record<string, unknown>, "label", locale)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
