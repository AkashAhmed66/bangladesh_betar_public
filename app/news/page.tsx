"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowRight, Clock3, LoaderCircle, Newspaper } from "lucide-react";
import Link from "next/link";
import NewsAdSlot from "@/components/portal/NewsAdSlot";
import NewsFilterPanel from "@/components/portal/NewsFilterPanel";
import NewsRankingRail from "@/components/portal/NewsRankingRail";
import { useNewsArticles } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { NewsArticle } from "@/lib/types";

function StoryImage({ story, priority = false }: { story: NewsArticle; priority?: boolean }) {
  return story.image_url ? (
    <img src={story.image_url} alt="" loading={priority ? "eager" : "lazy"} className="size-full object-cover transition duration-700 group-hover:scale-[1.025]" />
  ) : (
    <span className="grid size-full place-items-center bg-sunken text-ink-mute"><Newspaper className="size-9" /></span>
  );
}

function LeadStory({ story }: { story: NewsArticle }) {
  const { locale, t } = useTranslation();
  return (
    <article className="group min-w-0">
      <Link href={`/news/${story.slug}`} className="block">
        <div className="aspect-[16/9] overflow-hidden bg-sunken"><StoryImage story={story} priority /></div>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</p>
        <h2 className="mt-2 max-w-4xl text-balance font-bangla text-3xl font-bold leading-[1.12] tracking-[-0.035em] group-hover:text-[var(--portal-color)] sm:text-4xl xl:text-5xl">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h2>
        <p className="mt-3 max-w-3xl clamp-2 text-base leading-7 text-ink-soft">{localizedText(story as unknown as Record<string, unknown>, "summary", locale)}</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-mute"><Clock3 className="size-3.5" /> {story.published} · {t("news.readTime", { minutes: story.read_time_minutes })}</p>
      </Link>
    </article>
  );
}

function SideStory({ story, image = true }: { story: NewsArticle; image?: boolean }) {
  const { locale } = useTranslation();
  return (
    <article className="group border-t border-edge pt-4 first:border-t-0 first:pt-0">
      <Link href={`/news/${story.slug}`} className={image ? "grid grid-cols-[7.5rem_1fr] gap-4" : "block"}>
        {image && <span className="aspect-[4/3] overflow-hidden bg-sunken"><StoryImage story={story} /></span>}
        <span className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.13em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</span>
          <span className="clamp-3 mt-1 block font-bangla text-lg font-bold leading-snug group-hover:text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</span>
          <span className="mt-2 block text-[11px] text-ink-mute">{story.published}</span>
        </span>
      </Link>
    </article>
  );
}

function NewsLoading() {
  const { t } = useTranslation();
  return <div className="grid min-h-[32rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /> {t("news.loadingRoom")}</div></div>;
}

export default function NewsPage() {
  const { locale, t } = useTranslation();
  const { data, error, isLoading } = useNewsArticles({ perPage: 24 });
  const stories = data?.data ?? [];

  if (isLoading) return <NewsLoading />;
  if (error || stories.length === 0) {
    return <div className="mx-auto grid min-h-[30rem] max-w-xl place-items-center px-5 text-center"><div><AlertCircle className="mx-auto size-9 text-[var(--portal-color)]" /><h1 className="mt-4 font-display text-3xl font-bold">{t("news.newsroomUnavailable")}</h1><p className="mt-2 text-sm text-ink-soft">{t("news.newsroomUnavailableDescription")}</p></div></div>;
  }

  const lead = stories.find((story) => story.is_featured) ?? stories[0];
  const remaining = stories.filter((story) => story.id !== lead.id);
  const sideStories = remaining.slice(0, 3);
  const latestStories = remaining.slice(3, 11);
  const categoryGroups = Array.from(new Set(stories.map((story) => story.category_slug || story.category)))
    .slice(0, 3)
    .map((category) => ({ category, stories: stories.filter((story) => (story.category_slug || story.category) === category).slice(0, 4) }))
    .filter((group) => group.stories.length > 1);
  const today = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", { dateStyle: "full", timeZone: "Asia/Dhaka" }).format(new Date());

  return (
    <div className="newsroom-page pb-0">
      <div className="mx-auto w-full max-w-[1480px] bg-elev px-4 pt-5 sm:px-7 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge pb-4 text-xs font-bold text-ink-mute"><span>{today}</span><span className="flex items-center gap-2"><span className="size-2 animate-pulse rounded-full bg-danger" /> {t("news.newsroomLive")}</span></div>
        <div className="flex flex-col gap-4 border-b-4 border-[var(--portal-color)] py-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--portal-color)]">{t("news.publicInterest")}</p><h1 className="mt-1 font-bangla text-4xl font-bold tracking-[-0.055em] sm:text-6xl">{t("news.portalName")}</h1></div>
          <p className="max-w-md text-sm leading-6 text-ink-soft sm:text-right">{t("news.newsroomDeck")}</p>
        </div>
        <NewsAdSlot format="leaderboard" className="my-7" />
        <section className="flex items-center gap-4 overflow-hidden border-y border-edge py-3" aria-label={t("news.justIn")}>
          <span className="shrink-0 bg-[var(--portal-color)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">{t("news.justIn")}</span>
          <div className="flex min-w-0 items-center gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{stories.slice(0, 4).map((story) => <Link key={story.id} href={`/news/${story.slug}`} className="shrink-0 font-bangla text-sm font-bold text-ink-soft hover:text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</Link>)}</div>
        </section>

        <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-10">
          <main className="min-w-0">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.7fr)] lg:gap-7"><LeadStory story={lead} /><div className="space-y-5 border-t border-edge pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">{sideStories.map((story) => <SideStory key={story.id} story={story} />)}</div></div>
            {latestStories.length > 0 && (
              <section className="mt-12 border-t-4 border-ink pt-5" aria-labelledby="latest-news-heading">
                <div className="flex items-center justify-between gap-4"><h2 id="latest-news-heading" className="font-bangla text-3xl font-bold tracking-tight">{t("news.latestNews")}</h2><Link href="/news/latest" className="inline-flex items-center gap-2 text-sm font-black text-[var(--portal-color)] hover:gap-3">{t("news.viewAll")} <ArrowRight className="size-4" /></Link></div>
                <div className="mt-5 grid gap-x-7 gap-y-6 sm:grid-cols-2">{latestStories.map((story) => <SideStory key={story.id} story={story} />)}</div>
              </section>
            )}
          </main>
          <aside className="space-y-7 xl:sticky xl:top-5"><NewsRankingRail /><NewsAdSlot format="rectangle" /></aside>
        </div>

        <NewsAdSlot format="in-article" className="my-12" />
        {categoryGroups.map((group) => {
          const first = group.stories[0];
          const categoryLabel = localizedText(first as unknown as Record<string, unknown>, "category", locale);
          return (
            <section key={group.category} className="mt-12 border-t-4 border-[var(--portal-color)] pt-5">
              <div className="flex items-center justify-between gap-4"><h2 className="font-bangla text-3xl font-bold">{categoryLabel}</h2><Link href={`/news/category/${first.category_slug}`} className="inline-flex items-center gap-2 text-sm font-black text-[var(--portal-color)]">{t("news.moreFromSection")} <ArrowRight className="size-4" /></Link></div>
              <div className="mt-6 grid gap-7 md:grid-cols-2 xl:grid-cols-4">{group.stories.map((story, index) => <article key={story.id} className={`group ${index > 0 ? "border-t border-edge pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0" : ""}`}><Link href={`/news/${story.slug}`}><div className="aspect-[16/10] overflow-hidden bg-sunken"><StoryImage story={story} /></div><h3 className="mt-3 clamp-3 font-bangla text-lg font-bold leading-snug group-hover:text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h3><p className="mt-2 text-xs text-ink-mute">{story.published}</p></Link></article>)}</div>
            </section>
          );
        })}
      </div>

      <div className="mt-16 bg-elev"><NewsFilterPanel /></div>
    </div>
  );
}
