"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowLeft, ArrowRight, Clock3, LoaderCircle, Newspaper, Radio, RadioTower } from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";
import NewsAdSlot from "@/components/portal/NewsAdSlot";
import NewsFilterPanel from "@/components/portal/NewsFilterPanel";
import NewsRankingRail from "@/components/portal/NewsRankingRail";
import { useNewsArticles, usePortalCategories } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { NewsArticle } from "@/lib/types";

interface NewsListingPageProps {
  title: string;
  description: string;
  categorySlug?: string;
  latest?: boolean;
}

function StoryImage({ story, eager = false }: { story: NewsArticle; eager?: boolean }) {
  return story.image_url ? (
    <img src={story.image_url} alt="" loading={eager ? "eager" : "lazy"} className="size-full object-cover transition duration-700 group-hover:scale-[1.03]" />
  ) : (
    <span className="grid size-full place-items-center bg-sunken text-ink-mute"><Newspaper className="size-8" /></span>
  );
}

function SectionLead({ article, pageTitle }: { article: NewsArticle; pageTitle: string }) {
  const { locale, t } = useTranslation();
  return (
    <article className="group overflow-hidden border border-edge bg-raised">
      <Link href={`/news/${article.slug}`} className="grid lg:grid-cols-[1.25fr_0.85fr]">
        <div className="aspect-[16/10] min-h-64 overflow-hidden bg-sunken lg:aspect-auto"><StoryImage story={article} eager /></div>
        <div className="relative flex flex-col justify-center p-6 sm:p-8">
          <span className="absolute inset-y-0 left-0 hidden w-1 bg-[var(--portal-color)] lg:block" />
          <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[var(--portal-color)]">{pageTitle}</p>
          <h2 className="mt-3 text-balance font-bangla text-3xl font-bold leading-[1.12] tracking-[-0.035em] group-hover:text-[var(--portal-color)] sm:text-4xl">{localizedText(article as unknown as Record<string, unknown>, "title", locale)}</h2>
          <p className="mt-4 clamp-3 text-sm leading-7 text-ink-soft">{localizedText(article as unknown as Record<string, unknown>, "summary", locale)}</p>
          <p className="mt-5 flex items-center gap-1.5 text-xs text-ink-mute"><Clock3 className="size-3.5" /> {article.published} <span aria-hidden="true">·</span> {t("news.readTime", { minutes: article.read_time_minutes })}</p>
        </div>
      </Link>
    </article>
  );
}

function StreamStory({ article, index }: { article: NewsArticle; index: number }) {
  const { locale, t } = useTranslation();
  return (
    <article className="group border-t border-edge py-5 first:border-t-0 first:pt-0">
      <Link href={`/news/${article.slug}`} className="grid grid-cols-[7.5rem_1fr] gap-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
        <div className="aspect-[4/3] overflow-hidden bg-sunken sm:aspect-[16/10]"><StoryImage story={article} /></div>
        <div className="min-w-0">
          <div className="flex items-center gap-2"><span className="font-display text-xs font-black text-ink-mute">{String(index + 1).padStart(2, "0")}</span><span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{localizedText(article as unknown as Record<string, unknown>, "category", locale)}</span></div>
          <h3 className="clamp-3 mt-2 font-bangla text-lg font-bold leading-snug group-hover:text-[var(--portal-color)] sm:text-2xl">{localizedText(article as unknown as Record<string, unknown>, "title", locale)}</h3>
          <p className="mt-2 hidden clamp-2 text-sm leading-6 text-ink-soft sm:block">{localizedText(article as unknown as Record<string, unknown>, "summary", locale)}</p>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-mute"><Clock3 className="size-3.5" /> {article.published} <span aria-hidden="true">·</span> {t("news.readTime", { minutes: article.read_time_minutes })}</p>
        </div>
      </Link>
    </article>
  );
}

export default function NewsListingPage({ title, description, categorySlug, latest = false }: NewsListingPageProps) {
  const { locale, t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data: categoryResponse } = usePortalCategories();
  const { data, error, isLoading } = useNewsArticles({ category: categorySlug, page, perPage: 12, sort: latest ? "latest" : undefined });
  const articles = data?.data ?? [];
  const currentPage = data?.meta?.current_page ?? page;
  const lastPage = data?.meta?.last_page ?? currentPage;
  const category = categoryResponse?.data.news.find((item) => item.slug === categorySlug);
  const localizedCategory = category ? localizedText(category as unknown as Record<string, unknown>, "label", locale) : title;
  const pageTitle = latest ? t("news.latest") : localizedCategory;
  const pageDescription = category
    ? localizedText(category as unknown as Record<string, unknown>, "description", locale) || t("news.categoryDescription", { category: localizedCategory.toLowerCase() })
    : latest
      ? t("news.latestDescription")
      : description;
  const lead = articles[0];
  const stream = articles.slice(1);

  return (
    <div className="news-section-edition pb-0">
      <div className="mx-auto w-full max-w-[1480px] px-4 pt-7 sm:px-7 sm:pt-10 lg:px-10">
        <header className={`news-section-banner relative overflow-hidden border-y border-edge bg-raised px-5 py-8 sm:px-8 sm:py-10 ${latest ? "is-latest" : ""}`}>
          <span className="absolute inset-y-0 left-0 w-1.5 bg-[var(--portal-color)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--portal-color)]">{latest ? t("news.latestEdition") : t("news.sectionEdition")}</p>
              <h1 className="mt-2 font-bangla text-4xl font-bold tracking-[-0.05em] sm:text-6xl">{pageTitle}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-ink-soft sm:text-base">{pageDescription}</p>
            </div>
            <Link href="/news" className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start border border-edge bg-elev px-5 text-sm font-black text-ink-soft transition hover:border-[var(--portal-color)] hover:text-[var(--portal-color)] sm:self-auto"><ArrowLeft className="size-4" /> {t("news.topStoriesLink")}</Link>
          </div>
        </header>

        <NewsAdSlot format="leaderboard" className="my-8" />

        <div className="grid items-start gap-9 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-10">
          <main className="min-w-0">
            {isLoading ? (
              <div className="grid min-h-[30rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /> {t("news.loading")}</div></div>
            ) : error ? (
              <div className="grid min-h-[30rem] place-items-center border border-edge bg-raised text-center"><div><AlertCircle className="mx-auto size-9 text-danger" /><h2 className="mt-4 font-display text-2xl font-bold">{t("news.sectionError")}</h2><p className="mt-2 text-sm text-ink-soft">{t("news.retry")}</p></div></div>
            ) : !lead ? (
              <div className="grid min-h-[30rem] place-items-center border border-dashed border-edge bg-raised px-6 text-center"><div><Newspaper className="mx-auto size-10 text-ink-mute" /><h2 className="mt-4 font-display text-2xl font-bold">{t("news.empty")}</h2><p className="mt-2 text-sm text-ink-soft">{t("news.emptyDescription")}</p></div></div>
            ) : (
              <>
                <SectionLead article={lead} pageTitle={pageTitle} />
                {stream.length > 0 && (
                  <section className="mt-10 border-t-4 border-ink pt-5" aria-labelledby="section-stream-title">
                    <div className="flex items-end justify-between gap-4"><div><h2 id="section-stream-title" className="font-bangla text-3xl font-bold">{t("news.moreNews")}</h2><p className="mt-1 text-sm text-ink-soft">{t("news.moreNewsDescription")}</p></div><span className="hidden text-xs font-black uppercase tracking-[0.14em] text-ink-mute sm:block">{t("news.resultsCount", { count: data?.meta?.total ?? articles.length })}</span></div>
                    <div className="mt-6">
                      {stream.map((article, index) => (
                        <Fragment key={article.id}>
                          <StreamStory article={article} index={(currentPage - 1) * 12 + index + 1} />
                          {index === 3 && <NewsAdSlot format="in-article" className="my-8" />}
                        </Fragment>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {lastPage > 1 && (
              <nav className="mt-10 flex flex-wrap items-center justify-center gap-3 border-t border-edge pt-8" aria-label={t("news.paginationLabel")}>
                <button type="button" disabled={currentPage <= 1} onClick={() => { setPage((value) => Math.max(1, value - 1)); document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex min-h-11 items-center gap-2 border border-edge px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="size-4" /> {t("common.previous")}</button>
                <span className="px-2 text-sm font-bold text-ink-mute">{t("common.pageOf", { page: currentPage, pages: lastPage })}</span>
                <button type="button" disabled={currentPage >= lastPage} onClick={() => { setPage((value) => Math.min(lastPage, value + 1)); document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex min-h-11 items-center gap-2 border border-edge px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">{t("common.next")} <ArrowRight className="size-4" /></button>
              </nav>
            )}
          </main>

          <aside className="space-y-7 xl:sticky xl:top-5">
            <NewsRankingRail />
            <NewsAdSlot format="rectangle" />
            <section className="overflow-hidden border-t-4 border-[var(--portal-color)] bg-raised p-6">
              <RadioTower className="size-7 text-[var(--portal-color)]" />
              <h2 className="mt-4 font-bangla text-2xl font-bold">{t("news.newsYouCanHear")}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{t("news.newsYouCanHearDescription")}</p>
              <Link href="/programmes" className="mt-5 inline-flex min-h-11 items-center gap-2 bg-[var(--portal-color)] px-4 text-sm font-black text-white"><Radio className="size-4" /> {t("news.exploreNewsProgrammes")}</Link>
            </section>
          </aside>
        </div>
      </div>

      <div className="mt-16"><NewsFilterPanel /></div>
    </div>
  );
}
