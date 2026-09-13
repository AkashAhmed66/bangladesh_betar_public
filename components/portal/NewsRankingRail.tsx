"use client";

import { Clock3, Eye, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useNewsArticles } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";

export default function NewsRankingRail({ className = "", category }: { className?: string; category?: string }) {
  const { locale, t } = useTranslation();
  const [tab, setTab] = useState<"latest" | "popular">("latest");
  const { data, isLoading } = useNewsArticles({ category, sort: tab, perPage: 5 });
  const stories = data?.data ?? [];

  return (
    <section className={`news-ranking border-t-[3px] border-ink ${className}`} aria-labelledby="news-ranking-title">
      <h2 id="news-ranking-title" className="sr-only">{t("news.newsRanking")}</h2>
      <div className="grid grid-cols-2 border-b border-edge" role="tablist" aria-label={t("news.newsRanking")}>
        {(["latest", "popular"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`relative min-h-12 px-2 text-left font-display text-sm font-black uppercase tracking-[0.02em] transition ${tab === item ? "text-ink" : "text-ink-mute hover:text-ink"}`}
          >
            {t(item === "latest" ? "news.latest" : "news.mostRead")}
            {tab === item && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--portal-color)]" />}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid min-h-56 place-items-center"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /></div>
      ) : (
        <ol className="divide-y divide-edge">
          {stories.map((story, index) => (
            <li key={story.id}>
              <Link href={`/news/${story.slug}`} className="group grid grid-cols-[2.25rem_1fr] gap-3 py-4">
                <span className="font-display text-3xl font-light leading-none text-ink-mute">{locale === "bn" ? new Intl.NumberFormat("bn-BD").format(index + 1) : index + 1}</span>
                <span className="min-w-0">
                  <span className="clamp-3 block font-bangla text-[15px] font-bold leading-[1.18] group-hover:underline">
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
