"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowRight, Clock3, LoaderCircle, Newspaper, Play } from "lucide-react";
import Link from "next/link";
import NewsAdSlot from "@/components/portal/NewsAdSlot";
import NewsFilterPanel from "@/components/portal/NewsFilterPanel";
import NewsLeadMosaic from "@/components/portal/NewsLeadMosaic";
import { useNewsArticles } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { NewsArticle } from "@/lib/types";

function StoryImage({ story, eager = false }: { story: NewsArticle; eager?: boolean }) {
  return story.image_url ? <img src={story.image_url} alt="" loading={eager ? "eager" : "lazy"} className="size-full object-cover transition duration-500 group-hover:scale-[1.025]" /> : <span className="grid size-full place-items-center bg-sunken text-ink-mute"><Newspaper className="size-8" /></span>;
}

function StoryMeta({ story }: { story: NewsArticle }) {
  const { locale, t } = useTranslation();
  return <span className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-ink-mute"><Clock3 className="size-3.5" /><span>{story.published}</span><span className="h-3 w-px bg-edge" /><span>{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</span><span className="hidden sm:inline">· {t("news.readTime", { minutes: story.read_time_minutes })}</span></span>;
}

function TextLead({ story }: { story: NewsArticle }) {
  const { locale } = useTranslation();
  return <article className="group min-w-0 lg:h-full"><Link href={`/news/${story.slug}`} className="flex h-full flex-col"><div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</p><h2 className="mt-3 text-balance font-bangla text-3xl font-bold leading-[1.04] tracking-[-0.04em] group-hover:text-[var(--portal-color)] sm:text-4xl">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h2><p className="mt-4 text-sm leading-6 text-ink-soft lg:clamp-6">{localizedText(story as unknown as Record<string, unknown>, "summary", locale)}</p></div><span className="mt-auto block pt-6"><StoryMeta story={story} /></span></Link></article>;
}

function ImageStory({ story, large = false, compact = false }: { story: NewsArticle; large?: boolean; compact?: boolean }) {
  const { locale } = useTranslation();
  return <article className="group min-w-0"><Link href={`/news/${story.slug}`} className="block"><div className={`${large ? "aspect-[16/9]" : "aspect-[16/10]"} relative overflow-hidden bg-sunken`}><StoryImage story={story} eager={large} />{story.media?.some((item) => item.type === "video" || item.type === "youtube") && <span className="absolute bottom-0 left-0 grid size-10 place-items-center bg-[var(--portal-color)] text-white"><Play className="size-4 fill-current" /></span>}</div><h3 className={`${large ? "text-2xl sm:text-3xl" : "text-lg"} mt-3 clamp-3 font-bangla font-bold leading-[1.16] group-hover:text-[var(--portal-color)]`}>{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h3>{!compact && <p className="mt-2 clamp-3 text-sm leading-5 text-ink-soft">{localizedText(story as unknown as Record<string, unknown>, "summary", locale)}</p>}<StoryMeta story={story} /></Link></article>;
}

function HeadlineStory({ story }: { story: NewsArticle }) {
  const { locale } = useTranslation();
  return <article className="group border-t border-edge py-4 first:border-t-0 first:pt-0"><Link href={`/news/${story.slug}`}><h3 className="clamp-3 font-bangla text-lg font-bold leading-[1.18] group-hover:text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h3><p className="mt-2 clamp-2 text-sm leading-5 text-ink-soft">{localizedText(story as unknown as Record<string, unknown>, "summary", locale)}</p><StoryMeta story={story} /></Link></article>;
}

function SectionTitle({ title, href }: { title: string; href?: string }) {
  const { t } = useTranslation();
  return <div className="mb-6 flex items-center justify-between gap-4 border-t-[3px] border-ink pt-3"><h2 className="font-display text-lg font-black uppercase tracking-[0.02em]">{title}</h2>{href && <Link href={href} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[var(--portal-color)]">{t("news.viewAll")} <ArrowRight className="size-4" /></Link>}</div>;
}

function NumberedStories({ stories, title, count = 5 }: { stories: NewsArticle[]; title: string; count?: number }) {
  const { locale } = useTranslation();
  return <section><SectionTitle title={title} /><ol className="grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">{stories.slice(0, count).map((story, index) => <li key={story.id} className="grid grid-cols-[2rem_1fr] gap-3"><span className="font-display text-4xl font-light leading-none text-ink-mute">{new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD").format(index + 1)}</span><Link href={`/news/${story.slug}`} className="clamp-3 font-bangla text-base font-bold leading-[1.15] hover:text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</Link></li>)}</ol></section>;
}

export default function NewsPage() {
  const { locale, t } = useTranslation();
  const { data, error, isLoading } = useNewsArticles({ perPage: 40 });
  const { data: popularData } = useNewsArticles({ perPage: 10, sort: "popular" });
  const stories = data?.data ?? [];
  if (isLoading) return <div className="grid min-h-[32rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /> {t("news.loadingRoom")}</div></div>;
  if (error || stories.length === 0) return <div className="mx-auto grid min-h-[30rem] max-w-xl place-items-center px-5 text-center"><div><AlertCircle className="mx-auto size-9 text-[var(--portal-color)]" /><h1 className="mt-4 font-display text-3xl font-bold">{t("news.newsroomUnavailable")}</h1><p className="mt-2 text-sm text-ink-soft">{t("news.newsroomUnavailableDescription")}</p></div></div>;

  const lead = stories.find((story) => story.is_featured) ?? stories[0];
  const rest = stories.filter((story) => story.id !== lead.id);
  const pick = (index: number) => rest[index] ?? lead;
  const today = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", { dateStyle: "full", timeZone: "Asia/Dhaka" }).format(new Date());
  const popular = popularData?.data?.length ? popularData.data : [...stories].sort((a, b) => b.views_count - a.views_count);

  return <div className="news-bbc-page pb-0"><div className="mx-auto w-full max-w-[1540px] px-4 sm:px-7 lg:px-10">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge py-4 text-xs font-bold text-ink-mute"><span>{today}</span><span className="flex items-center gap-2"><span className="size-2 animate-pulse rounded-full bg-danger" /> {t("news.newsroomLive")}</span></div>
    <NewsAdSlot format="leaderboard" className="my-7 sm:my-10" />
    <header className="border-y border-edge py-5 text-center"><p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--portal-color)]">{t("news.publicInterest")}</p><h1 className="mt-1 font-display text-4xl font-black uppercase tracking-[-0.045em] sm:text-5xl">{t("news.portalName")}</h1></header>
    <div className="py-8"><NewsLeadMosaic stories={[lead, ...rest.slice(0, 4)]} label={t("news.topStories")} /></div>
    <section className="py-8"><SectionTitle title={t("news.moreUpdates")} /><div className="grid items-start gap-7 lg:grid-cols-[minmax(14rem,.72fr)_minmax(0,1.55fr)_minmax(16rem,.78fr)]"><TextLead story={pick(4)} /><ImageStory story={pick(5)} large /><div className="divide-y divide-edge">{rest.slice(6, 9).map((story) => <HeadlineStory key={story.id} story={story} />)}</div></div><div className="mt-8 grid gap-7 sm:grid-cols-2 xl:grid-cols-4">{rest.slice(9, 13).map((story) => <ImageStory key={story.id} story={story} compact />)}</div></section>
    <NumberedStories stories={popular} title={t("news.mostRead")} count={5} />
    <NewsAdSlot format="in-article" className="my-12" />
    <section className="py-8"><SectionTitle title={t("news.latestNews")} href="/news/latest" /><div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">{rest.slice(16, 24).map((story) => <ImageStory key={story.id} story={story} />)}</div></section>
    <div className="my-10"><NumberedStories stories={stories.slice(5)} title={t("news.mostWatched")} count={10} /></div>
  </div><div className="mt-14 border-t border-edge bg-elev"><NewsFilterPanel /></div></div>;
}
