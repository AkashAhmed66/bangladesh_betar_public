"use client";

/* eslint-disable @next/next/no-img-element */
import { Clock3, Eye, LoaderCircle, Newspaper } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useNewsArticles } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";

export default function NewsRankingRail({ className = "" }: { className?: string }) {
  const { locale, t } = useTranslation();
  const [tab, setTab] = useState<"latest" | "popular">("latest");
  const { data, isLoading } = useNewsArticles({ sort: tab, perPage: 6 });
  const stories = data?.data ?? [];

  return (
    <section className={`news-ranking overflow-hidden border-t-4 border-[var(--portal-color)] bg-raised ${className}`} aria-labelledby="news-ranking-title">
      <h2 id="news-ranking-title" className="sr-only">{t("news.newsRanking")}</h2>
      <div className="grid grid-cols-2 border-b border-edge" role="tablist" aria-label={t("news.newsRanking")}>
        {(["latest", "popular"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`relative min-h-12 px-3 text-sm font-black transition ${tab === item ? "text-ink" : "text-ink-mute hover:text-ink"}`}
          >
            {t(item === "latest" ? "news.latest" : "news.mostRead")}
            {tab === item && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--portal-color)]" />}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid min-h-56 place-items-center"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /></div>
      ) : (
        <ol className="divide-y divide-edge px-4">
          {stories.map((story, index) => (
            <li key={story.id}>
              <Link href={`/news/${story.slug}`} className="group grid grid-cols-[4.75rem_1fr] gap-3 py-4">
                <span className="relative aspect-[4/3] overflow-hidden bg-sunken">
                  {story.image_url ? <img src={story.image_url} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <span className="grid size-full place-items-center text-ink-mute"><Newspaper className="size-5" /></span>}
                  <span className="absolute bottom-0 left-0 grid size-6 place-items-center bg-[var(--portal-color)] font-display text-xs font-black text-white">{locale === "bn" ? new Intl.NumberFormat("bn-BD").format(index + 1) : index + 1}</span>
                </span>
                <span className="min-w-0">
                  <span className="clamp-3 block font-bangla text-sm font-bold leading-snug group-hover:text-[var(--portal-color)]">
                    {localizedText(story as unknown as Record<string, unknown>, "title", locale)}
                  </span>
                  <span className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-mute">
                    {tab === "popular" ? <Eye className="size-3.5" /> : <Clock3 className="size-3.5" />}
                    {tab === "popular"
                      ? t("news.views", { count: new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD").format(story.views_count) })
                      : story.published}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
