"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowLeft, ArrowRight, Clock3, LoaderCircle, Newspaper, Quote, Sparkles } from "lucide-react";
import Link from "next/link";
import { use, useEffect } from "react";
import ContentActions from "@/components/engagement/ContentActions";
import NewsAdSlot from "@/components/portal/NewsAdSlot";
import NewsMediaGallery from "@/components/portal/NewsMediaGallery";
import NewsRankingRail from "@/components/portal/NewsRankingRail";
import { post } from "@/lib/api";
import { useApi, useNewsArticle } from "@/lib/hooks";
import { localizedList, localizedText, useTranslation } from "@/lib/i18n";
import type { NewsArticle, Paginated } from "@/lib/types";

function categorySlug(category: string): string {
  return category.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-");
}

function publishedDate(value: string | null, locale: "en" | "bn", fallback: string): string {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(value));
}

function RelatedStory({ story }: { story: NewsArticle }) {
  const { locale, t } = useTranslation();
  return (
    <Link href={`/news/${story.slug}`} className="group grid min-w-0 gap-4 border-t border-edge pt-5 sm:grid-cols-[9rem_1fr]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-sunken">
        {story.image_url ? <img src={story.image_url} alt="" loading="lazy" className="editorial-image size-full object-cover" /> : <div className="grid size-full place-items-center text-ink-mute"><Newspaper className="size-7" /></div>}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</p>
        <h3 className="mt-1 font-display text-lg font-bold leading-snug group-hover:underline">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-mute"><Clock3 className="size-3.5" /> {t("news.readTime", { minutes: story.read_time_minutes })}</p>
      </div>
    </Link>
  );
}

export default function NewsStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { locale, t } = useTranslation();
  const { slug } = use(params);
  const { data, error, isLoading } = useNewsArticle(slug);
  const story = data?.data;
  const relatedPath = story ? `/news?category=${encodeURIComponent(story.category_slug || categorySlug(story.category))}&per_page=5` : null;
  const { data: relatedResponse } = useApi<Paginated<NewsArticle>>(relatedPath);
  const related = (relatedResponse?.data ?? []).filter((article) => article.id !== story?.id).slice(0, 3);

  useEffect(() => {
    if (!story) return;
    const key = `betar.news.read.${story.id}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    void post(`/news/${encodeURIComponent(story.slug)}/view`).catch(() => window.sessionStorage.removeItem(key));
  }, [story]);

  if (isLoading) return <div className="grid min-h-[32rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-6 animate-spin text-[var(--portal-color)]" /> {t("news.articleLoading")}</div></div>;
  if (error || !story) {
    return <div className="mx-auto grid min-h-[32rem] max-w-xl place-items-center px-5 text-center"><div><AlertCircle className="mx-auto size-9 text-[var(--portal-color)]" /><h1 className="mt-4 font-display text-3xl font-bold">{t("news.articleUnavailable")}</h1><p className="mt-2 text-sm text-ink-soft">{t("news.articleUnavailableDescription")}</p><Link href="/news" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-page"><ArrowLeft className="size-4" /> {t("news.backToNews")}</Link></div></div>;
  }

  const title = localizedText(story as unknown as Record<string, unknown>, "title", locale);
  const summary = localizedText(story as unknown as Record<string, unknown>, "summary", locale);
  const category = localizedText(story as unknown as Record<string, unknown>, "category", locale);
  const body = localizedList(story as unknown as Record<string, unknown>, "body", locale);

  const highlights = body.slice(0, 3).map((paragraph) => {
    const firstSentence = paragraph.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
    return firstSentence ?? paragraph;
  });

  return (
    <article className="pb-24">
      <header className="relative overflow-hidden border-b border-edge">
        {story.image_url && <img src={story.image_url} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover opacity-[0.08] blur-3xl" />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-elev" />
        <div className="relative mx-auto w-full max-w-[1480px] px-4 pb-10 pt-7 sm:px-7 sm:pb-14 sm:pt-10 lg:px-10">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-ink-mute" aria-label="Breadcrumb">
            <Link href="/news" className="hover:text-ink">{t("common.news")}</Link><span>/</span>
            <Link href={`/news/category/${story.category_slug || categorySlug(story.category)}`} className="text-[var(--portal-color)] hover:underline">{category}</Link>
          </nav>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
            <div className="max-w-5xl">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--portal-color)]"><Sparkles className="size-3.5" /> {t("news.publicInterest")}</p>
              <h1 className="mt-4 max-w-5xl text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{title}</h1>
              <p className="mt-6 max-w-4xl text-lg leading-relaxed text-ink-soft sm:text-xl lg:text-2xl">{summary}</p>
            </div>
            <aside className="mx-auto w-full max-w-[20rem] space-y-6 lg:mx-0 lg:justify-self-end" aria-label={t("news.articleSidebar")}>
              <NewsAdSlot format="square" />
              <div className="border-l-4 border-[var(--portal-color)] pl-5">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-ink-mute">{t("news.filedBy")}</p>
                <p className="mt-1 font-display text-xl font-bold">{t("news.newsroom")}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("news.newsroomDescription")}</p>
              </div>
            </aside>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-edge pt-5 text-sm text-ink-mute">
            <span>{publishedDate(story.published_at, locale, t("news.recentlyPublished"))}</span>
            <span className="hidden size-1 rounded-full bg-ink-mute sm:block" />
            <span className="flex items-center gap-1.5"><Clock3 className="size-4" /> {t("news.readTime", { minutes: story.read_time_minutes })}</span>
            <ContentActions type="news_article" id={story.id} title={title} text={summary} className="ml-auto" />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-7 lg:px-10">
        <NewsMediaGallery
          key={story.id}
          articleTitle={title}
          media={story.media?.length ? story.media : story.image_url ? [{ id: `lead-${story.id}`, type: "image", url: story.image_url, name: title, mime_type: null, size_bytes: null, position: 0 }] : []}
        />

        <NewsAdSlot format="in-article" className="mt-12" />

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,48rem)_minmax(17rem,1fr)] lg:gap-20">
          <div>
            <div className="story-prose space-y-7 font-bangla text-lg leading-8 text-ink-soft sm:text-xl sm:leading-9">
              {body.map((paragraph, index) => <p key={`${story.id}-${index}`}>{paragraph}</p>)}
            </div>

            <blockquote className="portal-tint-panel relative mt-12 overflow-hidden rounded-panel p-7 sm:p-9">
              <Quote className="absolute right-5 top-5 size-14 text-[var(--portal-color)] opacity-15" />
              <p className="relative font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl">“{summary}”</p>
              <footer className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{t("news.context")}</footer>
            </blockquote>

            <div className="mt-12 flex flex-wrap items-center gap-2 border-y border-edge py-5">
              <span className="mr-2 text-xs font-black uppercase tracking-[0.14em] text-ink-mute">{t("news.filedUnder")}</span>
              {[category, t("news.bangladesh"), t("news.publicService")].filter((value, index, all) => all.indexOf(value) === index).map((tag) => <span key={tag} className="rounded-full bg-raised px-3 py-1.5 text-xs font-bold text-ink-soft">{tag}</span>)}
            </div>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-5">
            <section className="rounded-panel border border-edge bg-raised p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{t("news.atAGlance")}</p>
              <ul className="mt-5 space-y-4">
                {highlights.map((highlight, index) => <li key={index} className="flex gap-3 text-sm leading-relaxed text-ink-soft"><span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--portal-color)] text-[10px] font-black text-white">{index + 1}</span><span>{highlight}</span></li>)}
              </ul>
            </section>

            <section className="border-t-4 border-[var(--portal-color)] bg-sunken p-6">
              <Newspaper className="size-7 text-[var(--portal-color)]" />
              <h2 className="mt-4 font-display text-2xl font-bold">{t("news.independentReporting")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("news.independentReportingDescription")}</p>
              <Link href="/news/latest" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--portal-color)] hover:gap-3">{t("news.seeLatest")} <ArrowRight className="size-4" /></Link>
            </section>
            <NewsRankingRail />
            <NewsAdSlot format="rectangle" />
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-edge pt-10">
            <div className="flex items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{t("news.continueReading")}</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("news.moreIn", { category })}</h2></div><Link href={`/news/category/${story.category_slug || categorySlug(story.category)}`} className="hidden items-center gap-2 text-sm font-black text-ink-soft hover:text-ink sm:flex">{t("news.viewSection")} <ArrowRight className="size-4" /></Link></div>
            <div className="mt-7 grid gap-7 lg:grid-cols-3">{related.map((article) => <RelatedStory key={article.id} story={article} />)}</div>
          </section>
        )}
      </div>
    </article>
  );
}
