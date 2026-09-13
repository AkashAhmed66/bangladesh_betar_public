"use client";

import {
  BookOpen,
  ChevronDown,
  Clapperboard,
  Headphones,
  Languages,
  Library,
  LogOut,
  MessageSquareHeart,
  Music2,
  Newspaper,
  Podcast,
  Radio,
  RadioTower,
  Search,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { usePortalCategories, usePortalContentSearch } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import { portalForPath, type Portal } from "@/lib/portal";
import type { PortalCategory } from "@/lib/types";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

const PORTALS: { id: Portal; href: string; labelKey: string; icon: typeof Newspaper }[] = [
  { id: "news", href: "/news", labelKey: "common.news", icon: Newspaper },
  { id: "watch", href: "/watch", labelKey: "common.watch", icon: Clapperboard },
  { id: "listen", href: "/", labelKey: "common.listen", icon: Headphones },
];

type SubNavItem = { href: string; label: string; icon?: typeof Radio; badge?: string };

const LISTEN_SUB_NAV: { href: string; labelKey: string; icon?: typeof Radio }[] = [
  { href: "/", labelKey: "common.home" },
  { href: "/live", labelKey: "listenNav.liveRadio", icon: Radio },
  { href: "/songs", labelKey: "listenNav.songs", icon: Music2 },
  { href: "/albums", labelKey: "listenNav.albums" },
  { href: "/artists", labelKey: "listenNav.artists" },
  { href: "/programmes", labelKey: "listenNav.programmes", icon: RadioTower },
  { href: "/podcasts", labelKey: "listenNav.podcasts", icon: Podcast },
  { href: "/audiobooks", labelKey: "listenNav.audioBooks", icon: BookOpen },
  { href: "/library", labelKey: "listenNav.library", icon: Library },
];

const FALLBACK_NEWS_CATEGORY_DATA: Array<[string, string, string, boolean]> = [
  ["Bangladesh", "বাংলাদেশ", "bangladesh", true],
  ["Politics", "রাজনীতি", "politics", true],
  ["World", "বিশ্ব", "world", true],
  ["Business", "বাণিজ্য", "business", true],
  ["Sports", "খেলা", "sports", true],
  ["Entertainment", "বিনোদন", "entertainment", true],
  ["Jobs", "চাকরি", "jobs", true],
  ["Lifestyle", "জীবনযাপন", "lifestyle", true],
  ["Video", "ভিডিও", "video", true],
  ["Economy", "অর্থনীতি", "economy", false],
  ["Climate", "জলবায়ু", "climate", false],
  ["Culture", "সংস্কৃতি", "culture", false],
  ["Science", "বিজ্ঞান", "science", false],
  ["Environment", "পরিবেশ", "environment", false],
  ["Media", "গণমাধ্যম", "media", false],
];
const FALLBACK_NEWS_CATEGORIES: PortalCategory[] = FALLBACK_NEWS_CATEGORY_DATA.map(([label, labelBn, slug, showInHeader], index) => ({
  id: -(index + 1),
  value: label,
  label,
  label_bn: labelBn,
  slug,
  description: null,
  description_bn: null,
  show_in_header: showInHeader,
}));
const FALLBACK_WATCH_CATEGORY_DATA: [string, string, string, boolean][] = [
  ["Live TV", "সরাসরি টিভি", "live-tv", true],
  ["Movies", "চলচ্চিত্র", "movies", true],
  ["Series", "ধারাবাহিক", "series", true],
  ["Short Films", "স্বল্পদৈর্ঘ্য চলচ্চিত্র", "short-films", true],
  ["Songs", "গান ও সংগীত", "songs", true],
  ["Drama", "নাটক", "drama", true],
  ["Documentary", "প্রামাণ্যচিত্র", "documentary", true],
  ["Comedy", "কৌতুক ও রম্য", "comedy", false],
  ["Living and Culture", "জীবনধারা ও সংস্কৃতি", "living-and-culture", false],
  ["Horror", "ভৌতিক ও রহস্য", "horror", false],
  ["News and Current Affairs", "সংবাদ ও সমসাময়িক", "news-and-current-affairs", false],
  ["Popular Programmes", "জনপ্রিয় অনুষ্ঠান", "popular-programmes", false],
  ["Crime Drama", "ক্রাইম ড্রামা", "crime-drama", false],
];
const FALLBACK_WATCH_CATEGORIES: PortalCategory[] = FALLBACK_WATCH_CATEGORY_DATA.map(([label, labelBn, slug, showInHeader], index) => ({
  id: -(index + 1),
  value: label,
  label,
  label_bn: labelBn,
  slug,
  description: null,
  description_bn: null,
  show_in_header: showInHeader,
}));

function categoryHref(portal: "news" | "watch", category: PortalCategory): string {
  if (portal === "watch" && category.slug === "live-tv") return "/watch/live";
  return `/${portal}/category/${category.slug}`;
}

function PortalMark({ portal, label }: { portal: Portal; label: string }) {
  const Icon = portal === "news" ? Newspaper : portal === "watch" ? Clapperboard : Headphones;
  return (
    <Link href={portal === "news" ? "/news" : portal === "watch" ? "/watch" : "/"} className="flex shrink-0 items-center gap-2.5">
      <span className="portal-mark grid size-9 place-items-center rounded-full">
        <Icon className="size-4.5" />
      </span>
      <span className="hidden font-display text-xl font-bold tracking-[-0.04em] sm:block">
        Betar <span className="portal-ink capitalize">{label}</span>
      </span>
    </Link>
  );
}

export default function PortalHeader() {
  const pathname = usePathname();
  const portal = portalForPath(pathname);
  const { locale, t } = useTranslation();
  const { token, user, entitlements, logout } = useAuth();
  const { data: categoryResponse } = usePortalCategories();
  const setLocale = useUi((state) => state.setLocale);
  const toast = useUi((state) => state.toast);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [hiddenPath, setHiddenPath] = useState<string | null>(null);
  const [moreMenuPath, setMoreMenuPath] = useState<string | null>(null);
  const [searchPath, setSearchPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuOpen = menuPath === pathname;
  const moreMenuOpen = moreMenuPath === pathname;
  const searchOpen = searchPath === pathname && (portal === "news" || portal === "watch");
  const headerHidden = hiddenPath === pathname;
  const headerHiddenRef = useRef(headerHidden);
  const searchPortal = portal === "news" || portal === "watch" ? portal : null;
  const { data: searchResults, isLoading: searchLoading } = usePortalContentSearch(
    searchOpen ? searchPortal : null,
    debouncedSearchQuery,
  );
  const newsCategories = categoryResponse?.data.news ?? FALLBACK_NEWS_CATEGORIES;
  const watchCategories = categoryResponse?.data.watch ?? FALLBACK_WATCH_CATEGORIES;
  const categoryLabel = (category: PortalCategory) => localizedText(category as unknown as Record<string, unknown>, "label", locale);
  const headerCategories = portal === "news"
    ? newsCategories.filter((category) => category.show_in_header)
    : portal === "watch"
      ? watchCategories.filter((category) => category.show_in_header)
      : [];
  const moreCategories = portal === "news"
    ? newsCategories.filter((category) => !category.show_in_header)
    : portal === "watch"
      ? watchCategories.filter((category) => !category.show_in_header && !["movies", "series", "short-films", "songs", "live-tv"].includes(category.slug))
      : [];
  const subNav: SubNavItem[] = portal === "news"
    ? [
        { href: "/news/latest", label: t("news.latest") },
        ...headerCategories.map((category) => ({ href: categoryHref("news", category), label: categoryLabel(category) })),
      ]
    : portal === "watch"
      ? [
          { href: "/watch", label: t("common.home") },
          { href: "/watch/clips", label: t("watch.clips", { defaultValue: "Clips" }), badge: "Shorts" },
          { href: "/watch/category/movies", label: t("watch.movies", { defaultValue: "Movies" }) },
          { href: "/watch/category/series", label: t("watch.series", { defaultValue: "Series" }) },
          { href: "/watch/category/short-films", label: t("watch.shortFilms", { defaultValue: "Short Films" }) },
          { href: "/watch/category/songs", label: t("watch.songs", { defaultValue: "Songs" }) },
          { href: "/watch/live", label: t("watch.liveTv", { defaultValue: "Live TV" }) },
          ...headerCategories
            .filter((category) => !["movies", "series", "short-films", "songs", "live-tv"].includes(category.slug))
            .map((category) => ({ href: categoryHref("watch", category), label: categoryLabel(category) })),
          { href: "/watch/categories", label: t("common.categories") },
        ]
      : LISTEN_SUB_NAV.map((item) => ({ href: item.href, icon: item.icon, label: t(item.labelKey) }));

  useEffect(() => {
    headerHiddenRef.current = headerHidden;
  }, [headerHidden]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuPath(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  useEffect(() => {
    if (!moreMenuOpen) return;
    const close = (event: MouseEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) setMoreMenuPath(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreMenuPath(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [moreMenuOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    const focusFrame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    const close = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchPath(null);
        setSearchQuery("");
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchPath(null);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [searchOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchQuery(searchQuery.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const revealBeforeInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      // Reveal before Next starts its transition, including same-path links
      // where usePathname intentionally does not change.
      headerHiddenRef.current = false;
      setHiddenPath(null);
    };
    const revealRestoredPage = () => {
      headerHiddenRef.current = false;
      setHiddenPath(null);
    };

    document.addEventListener("click", revealBeforeInternalNavigation, true);
    window.addEventListener("pageshow", revealRestoredPage);
    return () => {
      document.removeEventListener("click", revealBeforeInternalNavigation, true);
      window.removeEventListener("pageshow", revealRestoredPage);
    };
  }, []);

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>("[data-app-scroll-container]");
    if (!scroller) return;

    let lastScrollTop = Math.max(0, scroller.scrollTop);
    let accumulatedDistance = 0;
    let direction: -1 | 0 | 1 = 0;
    let transitionLockedUntil = 0;
    let animationFrame = 0;

    const setHeaderVisibility = (hidden: boolean) => {
      if (hidden === headerHiddenRef.current) return;

      headerHiddenRef.current = hidden;
      accumulatedDistance = 0;
      direction = 0;
      transitionLockedUntil = performance.now() + 420;
      setHiddenPath(hidden ? pathname : null);
    };

    const updateHeader = () => {
      animationFrame = 0;
      const currentScrollTop = Math.max(0, scroller.scrollTop);
      const distance = currentScrollTop - lastScrollTop;
      lastScrollTop = currentScrollTop;

      if (menuOpen || moreMenuOpen || searchOpen || currentScrollTop <= 24) {
        setHeaderVisibility(false);
        return;
      }

      // Collapsing the top row changes the main viewport height and may emit
      // synthetic scroll movement. Keep the reference position in sync while
      // the transition runs, but do not treat that movement as user intent.
      if (performance.now() < transitionLockedUntil || Math.abs(distance) < 0.5) {
        accumulatedDistance = 0;
        direction = 0;
        return;
      }

      const nextDirection: -1 | 1 = distance > 0 ? 1 : -1;
      if (nextDirection !== direction) {
        direction = nextDirection;
        accumulatedDistance = distance;
      } else {
        accumulatedDistance += distance;
      }

      if (!headerHiddenRef.current && currentScrollTop > 72 && accumulatedDistance >= 28) {
        setHeaderVisibility(true);
      } else if (headerHiddenRef.current && accumulatedDistance <= -18) {
        setHeaderVisibility(false);
      }
    };

    const handleScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateHeader);
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    // Reconcile immediately after a route/menu transition instead of waiting
    // for an unrelated future scroll event to repair stale visibility.
    updateHeader();
    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [menuOpen, moreMenuOpen, pathname, searchOpen]);

  return (
    <header className="portal-header-shell relative z-50 w-full min-w-0 max-w-full shrink-0 overflow-x-clip border-b border-edge bg-elev">
      <div aria-hidden={headerHidden} inert={headerHidden} className={`portal-primary-slot relative z-20 min-w-0 ${headerHidden ? "is-hidden" : ""}`}>
        <div className="portal-global-bar min-w-0 overflow-visible border-b border-white/8">
        <div className="mx-auto flex h-13 w-full min-w-0 max-w-[1540px] items-stretch px-4 sm:h-15 sm:px-7 lg:px-10">
          <Link href="/" className="flex shrink-0 items-center gap-2 pr-3 sm:pr-6" aria-label="Bangladesh Betar home">
            <span className="portal-brand-icon relative grid size-9 place-items-center rounded-full">
              <RadioTower className="size-6 stroke-[2.25]" />
              <span className="portal-brand-live absolute right-0 top-0 size-2.5 rounded-full bg-[#f42a41]" />
            </span>
            <span className="hidden leading-none md:block">
              <span className="portal-brand-title block text-ink">Bangladesh <span className="portal-brand-title-accent">Betar</span></span>
              <span className="portal-brand-subtitle mt-1.5 block font-bangla text-ink-mute">বাংলাদেশ বেতার</span>
            </span>
          </Link>

          <nav className="flex min-w-0 flex-1 items-stretch gap-1.5 sm:flex-none sm:gap-2" aria-label="Betar services">
            {PORTALS.map(({ id, href, labelKey, icon: Icon }) => {
              const active = id === portal;
              const label = t(labelKey);
              return (
                <Link
                  key={id}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`portal-tab portal-tab-${id} relative flex min-w-0 flex-1 items-center justify-center gap-2 px-2 sm:min-w-24 sm:flex-none sm:px-5 ${active ? "is-active" : ""}`}
                >
                  <Icon className="size-4 sm:hidden" />
                  <span className="portal-tab-label">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden flex-1 sm:block" />
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "bn" : "en")}
              className="portal-control flex min-h-10 items-center gap-1.5 rounded-full border px-2.5 text-xs font-bold transition sm:px-3"
              aria-label={t("common.switchLanguage")}
            >
              <Languages className="size-4" /> <span className="hidden md:inline">{t("common.switchLanguage")}</span>
            </button>

            {token ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuPath(null);
                    setMenuPath((openPath) => openPath === pathname ? null : pathname);
                  }}
                  aria-expanded={menuOpen}
                  className="portal-control flex min-h-10 items-center gap-2 rounded-full border p-1 transition sm:pr-3"
                >
                  <span className="portal-avatar grid size-7 place-items-center rounded-full text-xs font-black">
                    {user?.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                  <span className="hidden max-w-28 truncate text-xs font-bold sm:block">{user?.name}</span>
                </button>
                {menuOpen && (
                  <div className="fade-up absolute right-0 z-[70] mt-2 w-[min(15rem,calc(100vw-1.5rem))] rounded-panel border border-edge bg-raised p-1.5 text-ink shadow-2xl shadow-shade/40">
                    <div className="border-b border-edge px-3 py-2">
                      <p className="truncate text-sm font-bold">{user?.name}</p>
                      <p className="truncate text-xs text-ink-mute">{user?.email}</p>
                      {entitlements?.is_premium && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-premium">{t("common.premiumMember")}</p>}
                    </div>
                    <Link href="/account" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-highlight hover:text-ink">
                      <User className="size-4" /> {t("common.account")}
                    </Link>
                    <Link href="/support" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-highlight hover:text-ink">
                      <MessageSquareHeart className="size-4" /> {t("common.support")}
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setMenuPath(null);
                        await logout();
                        toast(t("common.signedOut"), "success");
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-highlight hover:text-ink"
                    >
                      <LogOut className="size-4" /> {t("common.signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="portal-control flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition sm:px-5 sm:text-sm">
                <User className="size-4" /> <span className="hidden sm:inline">{t("common.login")}</span>
              </Link>
            )}
          </div>
        </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex h-13 w-full min-w-0 max-w-[1540px] items-stretch gap-4 px-4 sm:h-15 sm:px-7 lg:px-10">
        <PortalMark portal={portal} label={t(`common.${portal}`)} />
        <nav className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={`${portal} navigation`}>
          {subNav.map(({ href, label, badge }) => {
            const exactPath = href.split("#")[0];
            const active = !href.includes("#") && (
              href === "/"
                ? pathname === "/"
                : portal === "listen" || exactPath === "/watch/live" || exactPath === "/watch/clips"
                  ? pathname === exactPath || pathname.startsWith(`${exactPath}/`)
                  : pathname === exactPath
            );
            return (
              <Link
                key={href}
                href={href}
                scroll={false}
                className={`portal-sub-link relative flex shrink-0 items-center gap-1.5 px-3 text-sm font-bold transition sm:px-4 ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span>{label}</span>
                {badge && (
                  <span className="rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-500">
                    {badge}
                  </span>
                )}
                {active && <span className="portal-sub-active absolute inset-x-3 bottom-0 h-1 rounded-t-full sm:inset-x-4" />}
              </Link>
            );
          })}
          {(portal === "news" || portal === "watch") && moreCategories.length > 0 && (
            <div ref={moreMenuRef} className="relative flex shrink-0 items-stretch">
              <button
                type="button"
                onClick={() => {
                  headerHiddenRef.current = false;
                  setHiddenPath(null);
                  setMenuPath(null);
                  setMoreMenuPath((openPath) => openPath === pathname ? null : pathname);
                }}
                aria-expanded={moreMenuOpen}
                aria-controls={`${portal}-category-menu`}
                className={`portal-sub-link flex items-center gap-1.5 px-3 text-sm font-bold transition sm:px-4 ${moreMenuOpen ? "text-ink" : "text-ink-soft hover:text-ink"}`}
              >
                {t("common.more")} <ChevronDown className={`size-4 transition-transform ${moreMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {moreMenuOpen && (
                <div id={`${portal}-category-menu`} className={`fade-up fixed inset-x-0 z-[80] border-y border-edge bg-elev/95 shadow-2xl shadow-shade/30 backdrop-blur-xl ${headerHidden ? "top-[52px] sm:top-[60px]" : "top-[104px] sm:top-[120px]"}`}>
                  <div className="mx-auto grid w-full max-w-[1540px] gap-6 px-4 py-7 sm:px-7 lg:grid-cols-[18rem_1fr] lg:px-10">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{t(`${portal}.moreCategories`)}</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(`${portal}.moreCategoriesDescription`)}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {moreCategories.map((category) => {
                        const description = locale === "bn" ? category.description_bn ?? category.description : category.description;
                        return (
                          <Link key={category.slug} href={categoryHref(portal, category)} scroll={false} onClick={() => setMoreMenuPath(null)} className="group rounded-card border border-edge bg-raised px-4 py-3 transition hover:border-[var(--portal-color)] hover:bg-highlight">
                            <span className="font-display text-base font-bold group-hover:text-[var(--portal-color)]">{categoryLabel(category)}</span>
                            {description && <span className="mt-1 clamp-2 block text-xs leading-relaxed text-ink-mute">{description}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
        {portal === "listen" ? (
          <Link
            href="/search"
            className="hidden min-h-11 shrink-0 items-center gap-2 self-center rounded-full bg-raised px-4 text-sm font-semibold text-ink-soft transition hover:bg-highlight hover:text-ink lg:flex"
          >
            <Search className="size-4.5" /> {t("common.search")}
          </Link>
        ) : (
          <div ref={searchRef} className={`portal-header-search relative z-40 shrink-0 self-center ${searchOpen ? "is-open" : ""}`}>
            {searchOpen ? (
              <form
                role="search"
                className="flex h-11 w-full items-center gap-2 rounded-full border border-edge bg-raised px-3 shadow-lg shadow-shade/10"
                onSubmit={(event) => event.preventDefault()}
              >
                <Search className="size-4.5 shrink-0 text-[var(--portal-color)]" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t(`${portal}.searchPlaceholder`)}
                  aria-label={t(`${portal}.searchPlaceholder`)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink-mute"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchPath(null);
                    setSearchQuery("");
                  }}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-ink-mute transition hover:bg-highlight hover:text-ink"
                  aria-label={t("common.closeSearch")}
                >
                  <X className="size-4" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  headerHiddenRef.current = false;
                  setHiddenPath(null);
                  setMenuPath(null);
                  setMoreMenuPath(null);
                  setSearchPath(pathname);
                }}
                aria-expanded="false"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-raised px-3 text-sm font-semibold text-ink-soft transition hover:bg-highlight hover:text-ink lg:px-4"
              >
                <Search className="size-4.5 shrink-0" />
                <span className="hidden lg:inline">{t("common.search")}</span>
              </button>
            )}

            {searchOpen && debouncedSearchQuery.length >= 2 && (
              <div className="fade-up absolute right-0 top-[calc(100%+0.5rem)] w-full min-w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-panel border border-edge bg-raised p-2 text-ink shadow-2xl shadow-shade/35">
                <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">
                  {t(`${portal}.searchResults`)}
                </p>
                {searchLoading ? (
                  <p className="px-3 py-5 text-sm text-ink-mute">{t("common.searching")}</p>
                ) : searchResults?.data.length ? (
                  <>
                  <div className="grid gap-1">
                    {searchResults.data.map((item) => {
                      const title = localizedText(item as unknown as Record<string, unknown>, "title", locale);
                      const category = localizedText(item as unknown as Record<string, unknown>, "category", locale);
                      return (
                        <Link
                          key={`${item.type}-${item.id}`}
                          href={`/${portal}/${item.slug}`}
                          onClick={() => {
                            setSearchPath(null);
                            setSearchQuery("");
                          }}
                          className="group flex items-center gap-3 rounded-card p-2 transition hover:bg-highlight"
                        >
                          <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-highlight text-[var(--portal-color)]">
                            {item.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.image_url} alt="" className="size-full object-cover" />
                            ) : item.type === "news_article" ? (
                              <Newspaper className="size-5" />
                            ) : (
                              <Clapperboard className="size-5" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="clamp-2 block font-display text-sm font-bold leading-snug group-hover:text-[var(--portal-color)]">{title}</span>
                            <span className="mt-1 block truncate text-xs text-ink-mute">{category}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  {portal === "news" && (
                    <Link
                      href="/news/search"
                      onClick={() => {
                        setSearchPath(null);
                        setSearchQuery("");
                      }}
                      className="mt-2 flex items-center justify-center border-t border-edge px-3 pt-3 text-xs font-black text-[var(--portal-color)] hover:underline"
                    >
                      {t("news.viewAll")}
                    </Link>
                  )}
                  </>
                ) : (
                  <p className="px-3 py-5 text-sm text-ink-mute">{t(`${portal}.noSearchResults`)}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
