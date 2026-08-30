"use client";

import { ExternalLink, Mail, MapPin, RadioTower } from "lucide-react";
import Link from "next/link";
import { usePortalCategories } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";

const INFO_LINKS = ["about", "editorial-policy", "privacy", "terms", "contact", "advertise"] as const;

export default function NewsFooter() {
  const { locale, t } = useTranslation();
  const { data } = usePortalCategories();
  const categories = data?.data.news ?? [];

  return (
    <footer className="news-footer border-t border-edge bg-sunken text-ink" aria-labelledby="news-footer-title">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-12 sm:px-7 lg:px-10 lg:py-16">
        <div className="grid gap-10 border-b border-edge pb-12 md:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/news" className="inline-flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-[var(--portal-color)] text-white"><RadioTower className="size-6" /></span>
              <span><span id="news-footer-title" className="block font-display text-2xl font-black tracking-[-0.04em]">{t("news.portalName")}</span><span className="mt-0.5 block font-bangla text-xs font-bold text-ink-mute">{t("brand.nameNative")}</span></span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-ink-soft">{t("news.footerMission")}</p>
            <a href="https://betar.gov.bd" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--portal-color)] hover:underline">{t("news.officialWebsite")} <ExternalLink className="size-4" /></a>
          </div>

          <nav aria-label={t("news.footerSections")}>
            <h2 className="text-xs font-black uppercase tracking-[0.17em] text-ink-mute">{t("news.footerSections")}</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-bold">
              {categories.slice(0, 10).map((category) => <li key={category.id}><Link href={`/news/category/${category.slug}`} className="text-ink-soft hover:text-[var(--portal-color)]">{localizedText(category as unknown as Record<string, unknown>, "label", locale)}</Link></li>)}
            </ul>
          </nav>

          <nav aria-label={t("news.footerInformation")}>
            <h2 className="text-xs font-black uppercase tracking-[0.17em] text-ink-mute">{t("news.footerInformation")}</h2>
            <ul className="mt-5 space-y-3 text-sm font-bold">
              {INFO_LINKS.map((item) => <li key={item}><Link href={`/news/${item}`} className="text-ink-soft hover:text-[var(--portal-color)]">{t(`news.footerLinks.${item}`)}</Link></li>)}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.17em] text-ink-mute">{t("news.footerContact")}</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-ink-soft">
              <p className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-[var(--portal-color)]" /><span>{t("news.officeAddress")}</span></p>
              <a href="mailto:adgnews@betar.gov.bd" className="flex gap-3 hover:text-[var(--portal-color)]"><Mail className="mt-0.5 size-4 shrink-0 text-[var(--portal-color)]" /><span>adgnews@betar.gov.bd</span></a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>{t("news.copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/" className="hover:text-ink">{t("common.listen")}</Link><Link href="/watch" className="hover:text-ink">{t("common.watch")}</Link><Link href="/support" className="hover:text-ink">{t("common.support")}</Link></div>
        </div>
      </div>
    </footer>
  );
}
