"use client";

import { ArrowLeft, BadgeInfo, BookOpenCheck, Building2, FileCheck2, Mail, Megaphone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export type NewsInfoPageId = "about" | "contact" | "advertise" | "privacy" | "terms" | "editorialPolicy";

const PAGE_CONFIG: Record<NewsInfoPageId, { icon: typeof BadgeInfo; sectionCount: number }> = {
  about: { icon: BadgeInfo, sectionCount: 3 },
  contact: { icon: Building2, sectionCount: 3 },
  advertise: { icon: Megaphone, sectionCount: 3 },
  privacy: { icon: ShieldCheck, sectionCount: 4 },
  terms: { icon: FileCheck2, sectionCount: 4 },
  editorialPolicy: { icon: BookOpenCheck, sectionCount: 4 },
};

export default function NewsInfoPage({ page }: { page: NewsInfoPageId }) {
  const { t } = useTranslation();
  const config = PAGE_CONFIG[page];
  const Icon = config.icon;

  return (
    <main className="mx-auto w-full max-w-[1540px] px-4 pb-24 pt-8 sm:px-7 sm:pt-12 lg:px-10">
      <Link href="/news" className="inline-flex items-center gap-2 text-sm font-black text-ink-soft hover:text-[var(--portal-color)]"><ArrowLeft className="size-4" /> {t("news.backToNews")}</Link>
      <header className="mt-8 grid gap-7 border-b border-edge pb-10 lg:grid-cols-[1fr_20rem] lg:items-end">
        <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--portal-color)]">{t("news.info.eyebrow")}</p><h1 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-[-0.045em] sm:text-6xl">{t(`news.info.${page}.title`)}</h1><p className="mt-5 max-w-3xl text-base leading-8 text-ink-soft sm:text-lg">{t(`news.info.${page}.intro`)}</p></div>
        <div className="portal-tint-panel grid aspect-[4/2.5] place-items-center rounded-panel"><Icon className="size-16 text-[var(--portal-color)]" /></div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,46rem)_1fr] lg:gap-16">
        <div className="space-y-9">
          {Array.from({ length: config.sectionCount }, (_, index) => index + 1).map((section) => (
            <section key={section} className="border-t border-edge pt-6">
              <h2 className="font-display text-2xl font-bold tracking-tight">{t(`news.info.${page}.section${section}Title`)}</h2>
              <p className="mt-3 whitespace-pre-line text-base leading-8 text-ink-soft">{t(`news.info.${page}.section${section}Body`)}</p>
            </section>
          ))}
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-panel border border-edge bg-raised p-6">
            <Mail className="size-6 text-[var(--portal-color)]" />
            <h2 className="mt-4 font-display text-xl font-bold">{t("news.info.helpTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{t("news.info.helpBody")}</p>
            <Link href="/news/contact" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--portal-color)] px-5 text-sm font-black text-white">{t("news.info.contactUs")}</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
