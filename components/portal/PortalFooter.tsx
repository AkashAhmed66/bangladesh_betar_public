"use client";

import {
  Clapperboard,
  ExternalLink,
  Headphones,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Radio,
  RadioTower,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortalCategories } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import { portalForPath, type Portal } from "@/lib/portal";

interface PortalFooterProps {
  portal?: Portal;
}

const INFO_LINKS = [
  { key: "about", href: "/news/about" },
  { key: "editorial-policy", href: "/news/editorial-policy" },
  { key: "privacy", href: "/news/privacy" },
  { key: "terms", href: "/news/terms" },
  { key: "contact", href: "/news/contact" },
  { key: "advertise", href: "/news/advertise" },
] as const;

function GooglePlayIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.609 1.814L13.792 12 3.61 22.186A2.2 2.2 0 013 20.654V3.346c0-.584.223-1.127.609-1.532z"
        fill="#00E676"
      />
      <path
        d="M17.18 8.613L4.99 1.58A2.22 2.22 0 003.609 1.814l10.183 10.187 3.388-3.388z"
        fill="#FFD600"
      />
      <path
        d="M3.61 22.186a2.22 2.22 0 001.38.234l12.19-7.033-3.388-3.388L3.61 22.186z"
        fill="#FF1744"
      />
      <path
        d="M20.584 10.573l-3.404-1.96-3.388 3.387 3.388 3.388 3.404-1.96a1.64 1.64 0 000-2.855z"
        fill="#00B0FF"
      />
    </svg>
  );
}

function AppleIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.66-.82 1.11-1.96.99-3.1-.96.04-2.18.66-2.86 1.46-.59.68-1.11 1.84-.97 2.95 1.08.08 2.18-.54 2.84-1.31z" />
    </svg>
  );
}

export default function PortalFooter({ portal: forcedPortal }: PortalFooterProps) {
  const { locale, t } = useTranslation();
  const pathname = usePathname();
  const portal = forcedPortal ?? portalForPath(pathname);
  const { data } = usePortalCategories();

  const newsCategories = data?.data.news ?? [];
  const watchCategories = data?.data.watch ?? [];

  const portalBrand =
    portal === "watch"
      ? {
          title: t("watch.portalName"),
          native: "বাংলাদেশ বেতার ওয়াচ",
          icon: Clapperboard,
          href: "/watch",
          desc: "Watch original television dramas, documentaries, cultural performances, and live public broadcasting from Bangladesh Betar.",
          color: "var(--portal-color, #e50914)",
        }
      : portal === "news"
        ? {
            title: t("news.portalName"),
            native: t("brand.nameNative"),
            icon: RadioTower,
            href: "/news",
            desc: t("news.footerMission"),
            color: "var(--portal-color, #006a4e)",
          }
        : {
            title: t("brand.name"),
            native: t("brand.nameNative"),
            icon: Headphones,
            href: "/",
            desc: "The national public audio archive preserving music, radio dramas, history, and live broadcasting for Bangladesh and the world.",
            color: "var(--portal-color, #00875a)",
          };

  return (
    <footer className="portal-footer border-t border-edge bg-sunken text-ink" aria-labelledby="portal-footer-title">
      <div className="mx-auto w-full max-w-[1540px] px-4 py-12 sm:px-7 lg:px-10 lg:py-16">
        {/* App Download Promo Banner */}
        <div className="relative mb-14 overflow-hidden rounded-panel border border-edge bg-raised p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-highlight px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">
                <Smartphone className="size-3.5" /> {t("common.mobileApp", { defaultValue: "Betar on Mobile" })}
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {t("common.downloadAppTitle", { defaultValue: "Experience Betar Anywhere, Anytime" })}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
                {t("common.downloadAppDesc", {
                  defaultValue:
                    "Stream high-fidelity radio, watch original shows, read breaking public-service news, and access offline downloads with our official app.",
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Google Play Store Badge */}
              <a
                href="https://play.google.com/store/apps/details?id=bd.gov.betar.app"
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[3.25rem] items-center gap-3.5 rounded-xl border border-edge bg-elev px-4 py-2.5 shadow-sm transition hover:border-[var(--portal-color)] hover:shadow-md"
                aria-label="Download on Google Play Store"
              >
                <GooglePlayIcon className="size-7 shrink-0 transition group-hover:scale-105" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                    {t("common.getItOn", { defaultValue: "GET IT ON" })}
                  </p>
                  <p className="font-display text-sm font-black leading-tight text-ink">Google Play</p>
                </div>
              </a>

              {/* Apple App Store Badge */}
              <a
                href="https://apps.apple.com/app/bangladesh-betar/id644000000"
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[3.25rem] items-center gap-3.5 rounded-xl border border-edge bg-elev px-4 py-2.5 shadow-sm transition hover:border-[var(--portal-color)] hover:shadow-md"
                aria-label="Download on Apple App Store"
              >
                <AppleIcon className="size-7 shrink-0 transition group-hover:scale-105" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                    {t("common.downloadOnThe", { defaultValue: "Download on the" })}
                  </p>
                  <p className="font-display text-sm font-black leading-tight text-ink">App Store</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation & Directory Grid */}
        <div className="grid gap-10 border-b border-edge pb-12 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1.25fr_1fr_1fr_1fr]">
          {/* Brand Info */}
          <div className="max-w-sm">
            <Link href={portalBrand.href} className="inline-flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-[var(--portal-color)] text-white shadow-sm">
                <portalBrand.icon className="size-6" />
              </span>
              <span>
                <span id="portal-footer-title" className="block font-display text-2xl font-black tracking-[-0.04em]">
                  {portalBrand.title}
                </span>
                <span className="mt-0.5 block font-bangla text-xs font-bold text-ink-mute">
                  {portalBrand.native}
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{portalBrand.desc}</p>
            <a
              href="https://betar.gov.bd"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[var(--portal-color)] hover:underline"
            >
              {t("news.officialWebsite")} <ExternalLink className="size-3.5" />
            </a>
          </div>

          {/* Watch Portal Links */}
          <nav aria-label="Betar Watch Sections">
            <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-ink-mute">
              <Clapperboard className="size-3.5 text-[var(--portal-color)]" /> {t("common.watch")}
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs font-bold sm:grid-cols-1">
              <li>
                <Link href="/watch" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("common.home")}
                </Link>
              </li>
              <li>
                <Link href="/watch/clips" className="inline-flex items-center gap-1.5 font-bold text-ink-soft transition hover:text-[var(--portal-color)]">
                  <span>{t("watch.clips", { defaultValue: "Clips & Shorts" })}</span>
                  <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase text-rose-500">
                    New
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/watch/category/movies" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("watch.movies", { defaultValue: "Movies" })}
                </Link>
              </li>
              <li>
                <Link href="/watch/category/series" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("watch.series", { defaultValue: "Series" })}
                </Link>
              </li>
              <li>
                <Link href="/watch/category/short-films" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("watch.shortFilms", { defaultValue: "Short Films" })}
                </Link>
              </li>
              <li>
                <Link href="/watch/category/songs" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("watch.songs", { defaultValue: "Songs & Music" })}
                </Link>
              </li>
              <li>
                <Link href="/watch/category/documentary" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("watch.documentaries", { defaultValue: "Documentaries" })}
                </Link>
              </li>
              <li>
                <Link href="/watch/live" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("watch.liveTv", { defaultValue: "Live TV" })}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Listen Portal & News Links */}
          <nav aria-label="Listen & News Sections">
            <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-ink-mute">
              <Radio className="size-3.5 text-[var(--portal-color)]" /> {t("common.listen")} & {t("common.news")}
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs font-bold sm:grid-cols-1">
              <li>
                <Link href="/live" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("listenNav.liveRadio", { defaultValue: "Live Radio" })}
                </Link>
              </li>
              <li>
                <Link href="/songs" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("listenNav.songs", { defaultValue: "Audio Songs" })}
                </Link>
              </li>
              <li>
                <Link href="/programmes" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("listenNav.programmes", { defaultValue: "Programmes" })}
                </Link>
              </li>
              <li>
                <Link href="/podcasts" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("listenNav.podcasts", { defaultValue: "Podcasts" })}
                </Link>
              </li>
              <li>
                <Link href="/news/latest" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {t("news.latest", { defaultValue: "Latest News" })}
                </Link>
              </li>
              <li>
                <Link href="/news/category/bangladesh" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {locale === "bn" ? "বাংলাদেশ" : "Bangladesh"}
                </Link>
              </li>
              <li>
                <Link href="/news/category/politics" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {locale === "bn" ? "রাজনীতি" : "Politics"}
                </Link>
              </li>
              <li>
                <Link href="/news/category/business" className="text-ink-soft transition hover:text-[var(--portal-color)]">
                  {locale === "bn" ? "বাণিজ্য" : "Business"}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Information & Contact */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-ink-mute">
              {t("news.footerInformation")}
            </h3>
            <ul className="mt-4 space-y-2 text-xs font-bold">
              {INFO_LINKS.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="text-ink-soft transition hover:text-[var(--portal-color)]">
                    {t(`news.footerLinks.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 border-t border-edge pt-4 text-xs text-ink-soft">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-[var(--portal-color)]" />
                <span>{t("news.officeAddress")}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-3.5 shrink-0 text-[var(--portal-color)]" />
                <a href="mailto:info@betar.gov.bd" className="hover:text-[var(--portal-color)]">
                  info@betar.gov.bd
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Portal Switcher */}
        <div className="flex flex-col gap-4 pt-8 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>{t("news.copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-bold">
            <Link href="/" className={`transition hover:text-ink ${portal === "listen" ? "text-[var(--portal-color)]" : ""}`}>
              {t("common.listen")}
            </Link>
            <Link href="/watch" className={`transition hover:text-ink ${portal === "watch" ? "text-[var(--portal-color)]" : ""}`}>
              {t("common.watch")}
            </Link>
            <Link href="/news" className={`transition hover:text-ink ${portal === "news" ? "text-[var(--portal-color)]" : ""}`}>
              {t("common.news")}
            </Link>
            <Link href="/support" className="transition hover:text-ink">
              {t("common.support")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
