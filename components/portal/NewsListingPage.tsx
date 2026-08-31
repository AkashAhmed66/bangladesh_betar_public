"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock3, LoaderCircle, Newspaper } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import NewsAdSlot from "@/components/portal/NewsAdSlot";
import NewsFilterPanel from "@/components/portal/NewsFilterPanel";
import NewsRankingRail from "@/components/portal/NewsRankingRail";
import { useNewsArticles, usePortalCategories } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { NewsArticle, PortalCategory } from "@/lib/types";

interface NewsListingPageProps {
  title: string;
  description: string;
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

function FeatureLead({ story }: { story: NewsArticle }) {
  const { locale } = useTranslation();
  return (
    <article className="group relative min-h-[26rem] overflow-hidden bg-sunken sm:min-h-[34rem]">
      <Link href={`/news/${story.slug}`} className="absolute inset-0">
        <StoryImage story={story} eager />
        <span className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-white/75">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</span>
          <span className="mt-3 block max-w-4xl text-balance font-bangla text-3xl font-bold leading-tight sm:text-5xl">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</span>
          <span className="mt-3 block max-w-3xl clamp-2 text-sm leading-6 text-white/80 sm:text-base">{localizedText(story as unknown as Record<string, unknown>, "summary", locale)}</span>
          <Meta story={story} inverse />
        </span>
      </Link>
    </article>
  );
}

function FeatureSide({ story }: { story: NewsArticle }) {
  const { locale } = useTranslation();
  return (
    <article className="group border-b border-edge pb-5 last:border-b-0 last:pb-0">
      <Link href={`/news/${story.slug}`} className="grid grid-cols-[7.5rem_1fr] gap-4 sm:grid-cols-[12rem_1fr] xl:grid-cols-1">
        <div className="aspect-[4/3] overflow-hidden bg-sunken xl:aspect-[16/9]"><StoryImage story={story} /></div>
        <div className="min-w-0 xl:pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</p>
          <h2 className="clamp-3 mt-2 font-bangla text-xl font-bold leading-snug group-hover:text-[var(--portal-color)] sm:text-2xl">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h2>
          <p className="mt-2 hidden clamp-2 text-sm leading-6 text-ink-soft sm:block">{localizedText(story as unknown as Record<string, unknown>, "summary", locale)}</p>
          <Meta story={story} />
        </div>
      </Link>
    </article>
  );
}

function SelectedCard({ story }: { story: NewsArticle }) {
  const { locale } = useTranslation();
  return (
    <article className="group w-[78vw] shrink-0 snap-start overflow-hidden border border-edge bg-raised sm:w-[21rem] lg:w-[23rem]">
      <Link href={`/news/${story.slug}`}>
        <div className="aspect-[16/10] overflow-hidden bg-sunken"><StoryImage story={story} /></div>
        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</p>
          <h3 className="clamp-3 mt-2 font-bangla text-xl font-bold leading-snug group-hover:text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h3>
          <Meta story={story} />
        </div>
      </Link>
    </article>
  );
}

function MoreStory({ story }: { story: NewsArticle }) {
  const { locale } = useTranslation();
  return (
    <article className="group border-b border-edge py-6 first:pt-0">
      <Link href={`/news/${story.slug}`} className="grid grid-cols-[minmax(0,1fr)_7rem] gap-4 sm:grid-cols-[minmax(0,1fr)_15rem] sm:gap-7">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</p>
          <h3 className="clamp-3 mt-2 font-bangla text-xl font-bold leading-snug group-hover:text-[var(--portal-color)] sm:text-2xl">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h3>
          <p className="mt-2 hidden clamp-2 text-sm leading-6 text-ink-soft sm:block">{localizedText(story as unknown as Record<string, unknown>, "summary", locale)}</p>
          <Meta story={story} />
        </div>
        <div className="aspect-[4/3] overflow-hidden bg-sunken"><StoryImage story={story} /></div>
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

export default function NewsListingPage({ title, description, categorySlug, latest = false }: NewsListingPageProps) {
  const { locale, t } = useTranslation();
  const [page, setPage] = useState(1);
  const selectedRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLElement>(null);
  const { data: categoryResponse } = usePortalCategories();
  const roots = categoryResponse?.data.news ?? [];
  const { category, parent } = findCategory(roots, categorySlug);
  const { data: featureData, error, isLoading } = useNewsArticles({ category: categorySlug, page: 1, perPage: 5, sort: latest ? "latest" : undefined });
  const { data: selectedData } = useNewsArticles({ category: categorySlug, page: 1, perPage: 10, featured: true });
  const { data: moreData, isLoading: moreLoading } = useNewsArticles({ category: categorySlug, page, perPage: 8, sort: "latest" });
  const featureStories = featureData?.data ?? [];
  const selectedStories = (selectedData?.data?.length ? selectedData.data : featureStories).slice(0, 10);
  const moreStories = moreData?.data ?? [];
  const currentPage = moreData?.meta?.current_page ?? page;
  const lastPage = moreData?.meta?.last_page ?? currentPage;
  const localizedCategory = category ? localizedText(category as unknown as Record<string, unknown>, "label", locale) : title;
  const pageTitle = latest ? t("news.latest") : localizedCategory;
  const pageDescription = category
    ? localizedText(category as unknown as Record<string, unknown>, "description", locale) || t("news.categoryDescription", { category: localizedCategory.toLowerCase() })
    : latest ? t("news.latestDescription") : description;
  const subnav = latest ? roots.filter((item) => item.show_in_header) : (parent?.subcategories ?? []);
  const pageNumbers = useMemo(() => Array.from({ length: lastPage }, (_, index) => index + 1).filter((number) => number === 1 || number === lastPage || Math.abs(number - currentPage) <= 1), [currentPage, lastPage]);
  const moveSelected = (direction: number) => selectedRef.current?.scrollBy({ left: direction * Math.min(selectedRef.current.clientWidth * 0.8, 760), behavior: "smooth" });
  const movePage = (next: number) => { setPage(next); requestAnimationFrame(() => moreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };

  return (
    <div className="news-section-edition pb-0">
      <div className="mx-auto w-full max-w-[1480px] px-4 pt-7 sm:px-7 sm:pt-10 lg:px-10">
        <header className={`news-section-banner relative overflow-hidden border-y border-edge bg-raised px-5 py-8 sm:px-8 sm:py-10 ${latest ? "is-latest" : ""}`}>
          <span className="absolute inset-y-0 left-0 w-1.5 bg-[var(--portal-color)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-4xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--portal-color)]">{latest ? t("news.latestEdition") : t("news.sectionEdition")}</p><h1 className="mt-2 font-bangla text-4xl font-bold tracking-[-0.05em] sm:text-6xl">{pageTitle}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-ink-soft sm:text-base">{pageDescription}</p></div>
            <Link href="/news" className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start border border-edge bg-elev px-5 text-sm font-black text-ink-soft transition hover:border-[var(--portal-color)] hover:text-[var(--portal-color)] sm:self-auto"><ArrowLeft className="size-4" /> {t("news.topStoriesLink")}</Link>
          </div>
        </header>

        <NewsAdSlot format="leaderboard" className="my-7 sm:my-9" />

        {subnav.length > 0 && (
          <nav className="news-subcategory-nav mb-8 border-y border-edge" aria-label={t("news.subcategories")}>
            <div className="flex items-center gap-1 overflow-x-auto py-2">
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
          <section className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-9" aria-label={t("news.featuredStories")}>
            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(16rem,0.8fr)]"><FeatureLead story={featureStories[0]} />{featureStories.length > 1 && <div className="grid content-start gap-5">{featureStories.slice(1, 4).map((story) => <FeatureSide key={story.id} story={story} />)}</div>}</div>
            <aside className="space-y-7"><NewsRankingRail category={categorySlug} /><NewsAdSlot format="rectangle" /></aside>
          </section>
        )}

        {selectedStories.length > 0 && (
          <section className="mt-14 border-t-4 border-[var(--portal-color)] pt-5" aria-labelledby="selected-news-title">
            <div className="flex items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{t("news.editorChoice")}</p><h2 id="selected-news-title" className="mt-1 font-bangla text-3xl font-bold sm:text-4xl">{t("news.selectedStories")}</h2><p className="mt-2 text-sm text-ink-soft">{t("news.selectedDescription")}</p></div><div className="hidden shrink-0 gap-2 sm:flex"><button type="button" onClick={() => moveSelected(-1)} className="grid size-11 place-items-center rounded-full border border-edge bg-raised transition hover:border-[var(--portal-color)] hover:text-[var(--portal-color)]" aria-label={t("common.previous")}><ChevronLeft className="size-5" /></button><button type="button" onClick={() => moveSelected(1)} className="grid size-11 place-items-center rounded-full border border-edge bg-raised transition hover:border-[var(--portal-color)] hover:text-[var(--portal-color)]" aria-label={t("common.next")}><ChevronRight className="size-5" /></button></div></div>
            <div ref={selectedRef} className="news-selected-scroll scrollbar-none mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3">{selectedStories.map((story) => <SelectedCard key={story.id} story={story} />)}</div>
          </section>
        )}

        <NewsAdSlot format="leaderboard" className="my-12" />

        <section ref={moreRef} className="scroll-mt-28 border-t-4 border-ink pt-5" aria-labelledby="more-news-title">
          <div className="flex items-end justify-between gap-4"><div><h2 id="more-news-title" className="font-bangla text-3xl font-bold sm:text-4xl">{t("news.moreNews")}</h2><p className="mt-2 text-sm text-ink-soft">{t("news.moreNewsDescription")}</p></div><span className="hidden text-xs font-black uppercase tracking-[0.14em] text-ink-mute sm:block">{t("news.resultsCount", { count: moreData?.meta?.total ?? moreStories.length })}</span></div>
          <div className="mt-7 grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
            <div className="min-w-0">{moreLoading ? <div className="grid min-h-64 place-items-center"><LoaderCircle className="size-6 animate-spin text-[var(--portal-color)]" /></div> : moreStories.map((story) => <MoreStory key={story.id} story={story} />)}</div>
            <aside className="hidden space-y-7 lg:sticky lg:top-5 lg:block"><NewsAdSlot format="rectangle" /><NewsRankingRail category={categorySlug} /></aside>
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
