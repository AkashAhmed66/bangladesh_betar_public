"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowRight, Clock3, LoaderCircle, Radio, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useNewsArticles } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { NewsArticle } from "@/lib/types";

function StoryCard({ story, large = false }: { story: NewsArticle; large?: boolean }) {
  const { locale, t } = useTranslation();
  const title = localizedText(story as unknown as Record<string, unknown>, "title", locale);
  const summary = localizedText(story as unknown as Record<string, unknown>, "summary", locale);
  const category = localizedText(story as unknown as Record<string, unknown>, "category", locale);
  return (
    <Link id={story.category.toLowerCase()} href={`/news/${story.slug}`} className="group block min-w-0 scroll-mt-32">
      <div className={`relative overflow-hidden rounded-panel bg-sunken ${large ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
        {story.image_url ? (
          <img src={story.image_url} alt="" loading={large ? "eager" : "lazy"} className="editorial-image size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-ink-mute"><Radio className="size-10" /></div>
        )}
      </div>
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--portal-color)]">{category}</p>
      <h3 className={`mt-1 break-words font-display font-bold leading-tight tracking-[-0.025em] group-hover:underline ${large ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}>
        {title}
      </h3>
      <p className="mt-2 clamp-2 text-sm leading-relaxed text-ink-soft">{summary}</p>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-mute"><Clock3 className="size-3.5" /> {story.published} · {t("news.readTime", { minutes: story.read_time_minutes })}</p>
    </Link>
  );
}

function NewsLoading() {
  const { t } = useTranslation();
  return (
    <div className="grid min-h-[28rem] place-items-center">
      <div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /> {t("news.loadingRoom")}</div>
    </div>
  );
}

export default function NewsPage() {
  const { locale, t } = useTranslation();
  const { data, error, isLoading } = useNewsArticles();
  const stories = data?.data ?? [];

  if (isLoading) return <NewsLoading />;
  if (error || stories.length === 0) {
    return (
      <div className="mx-auto grid min-h-[30rem] max-w-xl place-items-center px-5 text-center">
        <div><AlertCircle className="mx-auto size-9 text-[var(--portal-color)]" /><h1 className="mt-4 font-display text-3xl font-bold">{t("news.newsroomUnavailable")}</h1><p className="mt-2 text-sm text-ink-soft">{t("news.newsroomUnavailableDescription")}</p></div>
      </div>
    );
  }

  const lead = stories.find((story) => story.is_featured) ?? stories[0];
  const rest = stories.filter((story) => story.id !== lead.id);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1480px] px-4 pb-20 pt-7 sm:px-7 sm:pt-10 lg:px-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--portal-color)]"><Sparkles className="size-3.5" /> {t("news.publicInterest")}</p>
          <h1 className="font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">{t("news.topStories")}</h1>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-raised p-1 [scrollbar-width:none]">
          {["all", "national", "trending"].map((key, index) => <span key={key} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-[var(--portal-color)] text-white" : "text-ink-soft"}`}>{t(`news.${key}`)}</span>)}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-12">
        <div className="min-w-0">
          <div className="rounded-panel border border-edge bg-raised p-3 sm:p-5"><StoryCard story={lead} large /></div>
          {rest.length > 0 && <div className="mt-8 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">{rest.slice(0, 3).map((story) => <StoryCard key={story.slug} story={story} />)}</div>}
        </div>

        <aside className="border-t border-edge pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1" aria-labelledby="just-in-title">
          <div className="flex items-center justify-between">
            <h2 id="just-in-title" className="font-display text-2xl font-bold tracking-tight">{t("news.justIn")}</h2>
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-danger"><span className="size-2 animate-pulse rounded-full bg-danger" /> {t("news.live")}</span>
          </div>
          <ol className="mt-5">
            {stories.map((story, index) => (
              <li key={story.slug} className="relative border-l border-edge pb-6 pl-6 last:pb-0">
                <span className="absolute -left-1 top-1 size-2 rounded-full bg-[var(--portal-color)] ring-4 ring-elev" />
                <div className="flex items-center gap-2 text-xs text-ink-mute"><span className="font-bold text-ink-soft">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</span><span>·</span><span>{story.published}</span></div>
                <Link href={`/news/${story.slug}`} className="mt-1.5 block font-display text-base font-bold leading-snug hover:underline">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</Link>
                {index === 0 && <span className="mt-2 inline-flex rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-black uppercase text-warning">{t("news.developing")}</span>}
              </li>
            ))}
          </ol>
          <Link href="/news/latest" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-page transition hover:gap-3">{t("news.moreUpdates")} <ArrowRight className="size-4" /></Link>
        </aside>
      </div>

      {rest.length > 0 && (
        <section id="latest" className="mt-16 border-t border-edge pt-9 scroll-mt-32">
          <div className="flex items-end justify-between gap-4">
            <div><h2 className="editorial-rule font-display text-3xl font-bold tracking-tight">{t("news.moreNews")}</h2><p className="mt-2 text-sm text-ink-soft">{t("news.moreNewsDescription")}</p></div>
            <span className="hidden rounded-full border border-edge px-3 py-1 text-xs font-bold text-ink-mute sm:inline">{t("news.updatedBy")}</span>
          </div>
          <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{rest.map((story) => <StoryCard key={`more-${story.slug}`} story={story} />)}</div>
        </section>
      )}

      <section className="portal-tint-panel mt-16 overflow-hidden rounded-panel" id="culture">
        <div className="grid md:grid-cols-[1fr_1.25fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <p className="portal-tint-eyebrow text-xs font-black uppercase tracking-[0.18em]">{t("news.newsroom")}</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("news.newsYouCanHear")}</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft sm:text-base">{t("news.newsYouCanHearDescription")}</p>
            <Link href="/programmes" className="portal-tint-action mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-5 text-sm font-bold transition"><Radio className="size-4" /> {t("news.exploreNewsProgrammes")}</Link>
          </div>
          <div className="relative min-h-64">
            <Image src="/editorial/news-coast.png" alt="Community preparedness volunteers reviewing emergency supplies" fill className="object-cover" sizes="(max-width: 768px) 100vw, 55vw" />
            <div className="portal-tint-image-fade absolute inset-0 md:block" />
          </div>
        </div>
      </section>
    </div>
  );
}
