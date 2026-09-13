"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock3, LoaderCircle, Newspaper } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import NewsAdSlot from "@/components/portal/NewsAdSlot";
import NewsFilterPanel from "@/components/portal/NewsFilterPanel";
import NewsLeadMosaic from "@/components/portal/NewsLeadMosaic";
import NewsRankingRail from "@/components/portal/NewsRankingRail";
import { useNewsArticles, usePortalCategories } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { NewsArticle, PortalCategory } from "@/lib/types";

interface NewsListingPageProps {
  title: string;
  categorySlug?: string;
  latest?: boolean;
}

function StoryImage({ story, eager = false }: { story: NewsArticle; eager?: boolean }) {
  return story.image_url ? (
    <img src={story.image_url} alt="" loading={eager ? "eager" : "lazy"} className="size-full object-cover transition duration-700 group-hover:scale-[1.035]" />
  ) : (
    <span className="grid size-full place-items-center bg-sunken text-ink-mute"><Newspaper className="size-8" /></span>
  );
}

function Meta({ story, inverse = false }: { story: NewsArticle; inverse?: boolean }) {
  const { t } = useTranslation();
  return <p className={`mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium ${inverse ? "text-white/75" : "text-ink-mute"}`}><Clock3 className="size-3.5" /> {story.published}<span aria-hidden="true">·</span>{t("news.readTime", { minutes: story.read_time_minutes })}</p>;
}

function SelectedCard({ story }: { story: NewsArticle }) {
  const { locale } = useTranslation();
  return (
    <article className="group w-[82vw] shrink-0 snap-start border-r border-edge pr-5 last:border-r-0 sm:w-[20rem] lg:w-[22rem]">
      <Link href={`/news/${story.slug}`} className="block">
        <div className="aspect-[16/10] overflow-hidden bg-sunken"><StoryImage story={story} /></div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</p>
        <h3 className="clamp-3 mt-1.5 font-bangla text-xl font-bold leading-[1.16] group-hover:underline">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h3>
        <p className="mt-2 clamp-2 font-bangla text-sm leading-5 text-ink-soft">{localizedText(story as unknown as Record<string, unknown>, "summary", locale)}</p>
        <Meta story={story} />
      </Link>
    </article>
  );
}

function MoreStory({ story, featured = false }: { story: NewsArticle; featured?: boolean }) {
  const { locale } = useTranslation();
  const storyText = (
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</p>
      <h3 className={`${featured ? "text-2xl sm:text-3xl" : "text-xl"} clamp-3 mt-2 font-bangla font-bold leading-[1.12] group-hover:underline`}>{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h3>
      <p className="mt-3 clamp-3 font-bangla text-sm leading-6 text-ink-soft">{localizedText(story as unknown as Record<string, unknown>, "summary", locale)}</p>
      <Meta story={story} />
    </div>
  );
  return (
    <article className={`group min-w-0 border-b border-edge pb-6 ${featured ? "sm:col-span-2" : ""}`}>
      <Link href={`/news/${story.slug}`} className={featured ? "grid gap-5 md:grid-cols-[minmax(14rem,.8fr)_minmax(0,1.35fr)] md:items-start" : "block"}>
        {featured ? storyText : <div className="mb-4 aspect-[16/10] overflow-hidden bg-sunken"><StoryImage story={story} /></div>}
        {featured ? <div className="aspect-[16/9] overflow-hidden bg-sunken"><StoryImage story={story} /></div> : storyText}
      </Link>
    </article>
  );
}

function findCategory(roots: PortalCategory[], slug?: string): { category?: PortalCategory; parent?: PortalCategory } {
  if (!slug) return {};
  for (const root of roots) {
    if (root.slug === slug) return { category: root, parent: root };
    const child = root.subcategories?.find((item) => item.slug === slug);
    if (child) return { category: child, parent: root };
  }
  return {};
}

export default function NewsListingPage({ title, categorySlug, latest = false }: NewsListingPageProps) {
  const { locale, t } = useTranslation();
  const [page, setPage] = useState(1);
  const selectedRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLElement>(null);
  const { data: categoryResponse } = usePortalCategories();
  const roots = categoryResponse?.data.news ?? [];
  const { category, parent } = findCategory(roots, categorySlug);
  const { data: featureData, error, isLoading } = useNewsArticles({ category: categorySlug, page: 1, perPage: 24, sort: "latest" });
  const { data: selectedData } = useNewsArticles({ category: categorySlug, page: 1, perPage: 10, featured: true });
  const { data: moreData, isLoading: moreLoading } = useNewsArticles({ category: categorySlug, page, perPage: 8, sort: "latest" });
  const featureStories = featureData?.data ?? [];
  const selectedStories = (selectedData?.data?.length ? selectedData.data : featureStories).slice(0, 10);
  const moreStories = moreData?.data ?? [];
  const currentPage = moreData?.meta?.current_page ?? page;
  const lastPage = moreData?.meta?.last_page ?? currentPage;
  const localizedCategory = category ? localizedText(category as unknown as Record<string, unknown>, "label", locale) : title;
  const pageTitle = latest ? t("news.latest") : localizedCategory;
  const subnav = latest ? roots.filter((item) => item.show_in_header) : (parent?.subcategories ?? []);
  const pageNumbers = useMemo(() => Array.from({ length: lastPage }, (_, index) => index + 1).filter((number) => number === 1 || number === lastPage || Math.abs(number - currentPage) <= 1), [currentPage, lastPage]);
  const moveSelected = (direction: number) => selectedRef.current?.scrollBy({ left: direction * Math.min(selectedRef.current.clientWidth * 0.8, 760), behavior: "smooth" });
  const movePage = (next: number) => { setPage(next); requestAnimationFrame(() => moreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };

  return (
    <div className="news-section-edition pb-0">
      <div className="mx-auto w-full max-w-[1540px] px-4 pt-7 sm:px-7 sm:pt-10 lg:px-10">
        <NewsAdSlot format="leaderboard" className="mb-7 sm:mb-9" />

        <header className="border-y border-edge py-4 text-center sm:py-5">
          <h1 className="font-bangla text-3xl font-black leading-none tracking-[-0.035em] text-[var(--portal-color)] sm:text-4xl">{pageTitle}</h1>
        </header>

        {subnav.length > 0 && (
          <nav className="news-subcategory-nav mb-8 border-b border-edge" aria-label={t("news.subcategories")}>
            <div className="flex items-center justify-start gap-1 overflow-x-auto py-2 sm:justify-center">
              {!latest && parent && <Link href={`/news/category/${parent.slug}`} aria-current={category?.slug === parent.slug ? "page" : undefined} className={`shrink-0 px-4 py-2 text-sm font-bold transition hover:text-[var(--portal-color)] ${category?.slug === parent.slug ? "text-[var(--portal-color)]" : "text-ink-soft"}`}>{t("news.allSection", { category: localizedText(parent as unknown as Record<string, unknown>, "label", locale) })}</Link>}
              {subnav.map((item) => <Link key={item.id} href={`/news/category/${item.slug}`} aria-current={item.slug === category?.slug ? "page" : undefined} className={`shrink-0 border-l border-edge px-4 py-2 text-sm font-bold transition hover:text-[var(--portal-color)] ${item.slug === category?.slug ? "text-[var(--portal-color)]" : "text-ink-soft"}`}>{localizedText(item as unknown as Record<string, unknown>, "label", locale)}</Link>)}
            </div>
          </nav>
        )}

        {isLoading ? (
          <div className="grid min-h-[32rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /> {t("news.loading")}</div></div>
        ) : error ? (
          <div className="grid min-h-[30rem] place-items-center border border-edge bg-raised text-center"><div><AlertCircle className="mx-auto size-9 text-danger" /><h2 className="mt-4 font-display text-2xl font-bold">{t("news.sectionError")}</h2><p className="mt-2 text-sm text-ink-soft">{t("news.retry")}</p></div></div>
        ) : featureStories.length === 0 ? (
          <div className="grid min-h-[30rem] place-items-center border border-dashed border-edge bg-raised px-6 text-center"><div><Newspaper className="mx-auto size-10 text-ink-mute" /><h2 className="mt-4 font-display text-2xl font-bold">{t("news.empty")}</h2><p className="mt-2 text-sm text-ink-soft">{t("news.emptyDescription")}</p></div></div>
        ) : (
          <NewsLeadMosaic stories={featureStories.slice(0, 5)} label={t("news.featuredStories")} />
        )}

        {selectedStories.length > 0 && (
          <section className="mt-14 border-t-[3px] border-ink pt-3" aria-labelledby="selected-news-title">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="font-display text-sm font-black uppercase tracking-[0.04em] text-[var(--portal-color)]">{t("news.editorChoice")}</p>
                <h2 id="selected-news-title" className="mt-2 font-bangla text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">{t("news.selectedStories")}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{t("news.selectedDescription")}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => moveSelected(-1)} className="grid size-11 place-items-center border border-edge-strong bg-elev text-ink transition hover:border-ink hover:bg-ink hover:text-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--portal-color)]" aria-label={t("common.previous")}><ChevronLeft className="size-5" /></button>
                <button type="button" onClick={() => moveSelected(1)} className="grid size-11 place-items-center border border-[var(--portal-color)] bg-[var(--portal-color)] text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--portal-color)]" aria-label={t("common.next")}><ChevronRight className="size-5" /></button>
              </div>
            </div>
            <div ref={selectedRef} className="news-selected-scroll scrollbar-none mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto border-y border-edge py-6">{selectedStories.map((story) => <SelectedCard key={story.id} story={story} />)}</div>
          </section>
        )}

        <NewsAdSlot format="leaderboard" className="my-12" />

        <section ref={moreRef} className="scroll-mt-28 border-t-[3px] border-ink pt-3" aria-labelledby="more-news-title">
          <div className="flex items-end justify-between gap-4"><div><p className="font-display text-sm font-black uppercase tracking-[0.04em] text-[var(--portal-color)]">{t("news.latestNews")}</p><h2 id="more-news-title" className="mt-2 font-bangla text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{t("news.moreNews")}</h2><p className="mt-2 text-sm leading-6 text-ink-soft">{t("news.moreNewsDescription")}</p></div><span className="hidden text-xs font-black uppercase tracking-[0.14em] text-ink-mute sm:block">{t("news.resultsCount", { count: moreData?.meta?.total ?? moreStories.length })}</span></div>
          <div className="mt-7 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
            <div className="grid min-w-0 gap-x-6 gap-y-8 sm:grid-cols-2">{moreLoading ? <div className="grid min-h-64 place-items-center sm:col-span-2"><LoaderCircle className="size-6 animate-spin text-[var(--portal-color)]" /></div> : moreStories.map((story, index) => <MoreStory key={story.id} story={story} featured={index === 0} />)}</div>
            <aside className="space-y-8 lg:sticky lg:top-5"><NewsRankingRail category={categorySlug} /><NewsAdSlot format="rectangle" /></aside>
          </div>
          {lastPage > 1 && (
            <nav className="mt-9 flex flex-wrap items-center justify-center gap-2 border-t border-edge pt-7" aria-label={t("news.paginationLabel")}>
              <button type="button" disabled={currentPage <= 1} onClick={() => movePage(Math.max(1, currentPage - 1))} className="grid size-11 place-items-center border border-edge disabled:cursor-not-allowed disabled:opacity-40" aria-label={t("common.previous")}><ArrowLeft className="size-4" /></button>
              {pageNumbers.map((number, index) => <span key={number} className="contents">{index > 0 && number - pageNumbers[index - 1] > 1 && <span className="px-1 text-ink-mute">…</span>}<button type="button" onClick={() => movePage(number)} aria-current={number === currentPage ? "page" : undefined} className={`grid size-11 place-items-center border text-sm font-black ${number === currentPage ? "border-[var(--portal-color)] bg-[var(--portal-color)] text-white" : "border-edge hover:border-[var(--portal-color)]"}`}>{new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD").format(number)}</button></span>)}
              <button type="button" disabled={currentPage >= lastPage} onClick={() => movePage(Math.min(lastPage, currentPage + 1))} className="grid size-11 place-items-center border border-edge disabled:cursor-not-allowed disabled:opacity-40" aria-label={t("common.next")}><ArrowRight className="size-4" /></button>
            </nav>
          )}
        </section>
      </div>

      <div className="mt-16"><NewsFilterPanel /></div>
    </div>
  );
}
