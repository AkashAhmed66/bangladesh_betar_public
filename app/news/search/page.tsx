"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import NewsFilterPanel from "@/components/portal/NewsFilterPanel";
import { useTranslation } from "@/lib/i18n";

export default function NewsSearchPage() {
  const { t } = useTranslation();

  return (
    <main className="news-search-page bg-elev pb-20">
      <div className="mx-auto w-full max-w-[1540px] px-4 pt-7 sm:px-7 sm:pt-10 lg:px-10">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-black text-ink-soft transition hover:text-[var(--portal-color)]">
          <ArrowLeft className="size-4" /> {t("news.backToNews")}
        </Link>
        <header className="mt-7 border-y border-edge py-7 sm:mt-9 sm:py-9">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--portal-color)]"><Search className="size-3.5" /> {t("news.findNewsEyebrow")}</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{t("news.searchPageTitle")}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">{t("news.searchPageDescription")}</p>
        </header>
      </div>
      <div className="mt-8">
        <NewsFilterPanel showHeader={false} />
      </div>
    </main>
  );
}
  