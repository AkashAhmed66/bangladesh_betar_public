"use client";

import {
  BookOpen,
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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { usePortalCategories } from "@/lib/hooks";
import { portalForPath, type Portal } from "@/lib/portal";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

const PORTALS: { id: Portal; href: string; label: string; icon: typeof Newspaper }[] = [
  { id: "news", href: "/news", label: "News", icon: Newspaper },
  { id: "watch", href: "/watch", label: "Watch", icon: Clapperboard },
  { id: "listen", href: "/", label: "Listen", icon: Headphones },
];

type SubNavItem = { href: string; label: string; icon?: typeof Radio };

const LISTEN_SUB_NAV: SubNavItem[] = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live radio", icon: Radio },
  { href: "/songs", label: "Songs", icon: Music2 },
  { href: "/albums", label: "Albums" },
  { href: "/artists", label: "Artists" },
  { href: "/programmes", label: "Programmes", icon: RadioTower },
  { href: "/podcasts", label: "Podcasts", icon: Podcast },
  { href: "/audiobooks", label: "Audio books", icon: BookOpen },
  { href: "/library", label: "My library", icon: Library },
];

const FALLBACK_NEWS_CATEGORIES = ["Bangladesh", "Economy", "Climate", "Culture", "Science", "Environment", "Media"]
  .map((label) => ({ label, slug: label.toLowerCase().replaceAll(" ", "-") }));
const FALLBACK_WATCH_CATEGORIES = ["Live TV", "Drama", "Documentary", "Culture & music", "Kids"]
  .map((label) => ({ label, slug: label === "Culture & music" ? "culture" : label.toLowerCase().replaceAll(" ", "-") }));

function PortalMark({ portal }: { portal: Portal }) {
  const Icon = portal === "news" ? Newspaper : portal === "watch" ? Clapperboard : Headphones;
  return (
    <Link href={portal === "news" ? "/news" : portal === "watch" ? "/watch" : "/"} className="flex shrink-0 items-center gap-2.5">
      <span className="portal-mark grid size-9 place-items-center rounded-full">
        <Icon className="size-4.5" />
      </span>
      <span className="hidden font-display text-xl font-bold tracking-[-0.04em] sm:block">
        Betar <span className="portal-ink capitalize">{portal}</span>
      </span>
    </Link>
  );
}

export default function PortalHeader() {
  const pathname = usePathname();
  const portal = portalForPath(pathname);
  const { token, user, entitlements, logout } = useAuth();
  const { data: categoryResponse } = usePortalCategories();
  const locale = useUi((state) => state.locale);
  const setLocale = useUi((state) => state.setLocale);
  const toast = useUi((state) => state.toast);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [hiddenPath, setHiddenPath] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuOpen = menuPath === pathname;
  const headerHidden = hiddenPath === pathname;
  const newsCategories = categoryResponse?.data.news ?? FALLBACK_NEWS_CATEGORIES;
  const watchCategories = categoryResponse?.data.watch ?? FALLBACK_WATCH_CATEGORIES;
  const subNav: SubNavItem[] = portal === "news"
    ? [
        { href: "/news", label: "Top stories" },
        { href: "/news/latest", label: "Latest" },
        ...newsCategories.map((category) => ({ href: `/news/category/${category.slug}`, label: category.label })),
      ]
    : portal === "watch"
      ? [
          { href: "/watch", label: "Home" },
          { href: "/watch/live", label: "Live TV" },
          ...watchCategories
            .filter((category) => category.slug !== "live-tv")
            .map((category) => ({ href: `/watch/category/${category.slug}`, label: category.label })),
          { href: "/watch/categories", label: "Categories" },
        ]
      : LISTEN_SUB_NAV;

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuPath(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>("main");
    if (!scroller) return;

    let lastScrollTop = Math.max(0, scroller.scrollTop);
    let accumulatedDistance = 0;
    let direction: -1 | 0 | 1 = 0;
    // This effect restarts only for a route or menu change. Both conditions
    // intentionally begin with the primary row visible.
    let isHidden = false;
    let transitionLockedUntil = 0;
    let animationFrame = 0;

    const setHeaderVisibility = (hidden: boolean) => {
      if (hidden === isHidden) return;

      isHidden = hidden;
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

      if (menuOpen || currentScrollTop <= 24) {
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

      if (!isHidden && currentScrollTop > 72 && accumulatedDistance >= 28) {
        setHeaderVisibility(true);
      } else if (isHidden && accumulatedDistance <= -18) {
        setHeaderVisibility(false);
      }
    };

    const handleScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateHeader);
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [menuOpen, pathname]);

  return (
    <header className="portal-header-shell relative z-50 w-full min-w-0 max-w-full shrink-0 overflow-x-clip border-b border-edge bg-elev">
      <div aria-hidden={headerHidden} inert={headerHidden} className={`portal-primary-slot relative z-20 min-w-0 ${headerHidden ? "is-hidden" : ""}`}>
        <div className="portal-global-bar min-w-0 overflow-visible border-b border-white/8">
        <div className="mx-auto flex h-13 w-full min-w-0 max-w-[1600px] items-stretch px-3 sm:h-15 sm:px-6">
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
            {PORTALS.map(({ id, href, label, icon: Icon }) => {
              const active = id === portal;
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
              className="portal-control hidden min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition sm:flex"
              aria-label="Toggle language"
            >
              <Languages className="size-4" /> {locale === "en" ? "EN" : "বাংলা"}
            </button>

            {token ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuPath((openPath) => openPath === pathname ? null : pathname)}
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
                      {entitlements?.is_premium && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-premium">Premium member</p>}
                    </div>
                    <Link href="/account" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-highlight hover:text-ink">
                      <User className="size-4" /> Account
                    </Link>
                    <Link href="/support" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-highlight hover:text-ink">
                      <MessageSquareHeart className="size-4" /> Support
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        setMenuPath(null);
                        await logout();
                        toast("Signed out. See you soon!", "success");
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-highlight hover:text-ink"
                    >
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="portal-control flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition sm:px-5 sm:text-sm">
                <User className="size-4" /> <span className="hidden sm:inline">Log in</span>
              </Link>
            )}
          </div>
        </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex h-13 w-full min-w-0 max-w-[1600px] items-stretch gap-4 px-3 sm:h-15 sm:px-6">
        <PortalMark portal={portal} />
        <nav className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={`${portal} navigation`}>
          {subNav.map(({ href, label }) => {
            const exactPath = href.split("#")[0];
            const active = !href.includes("#") && (
              href === "/"
                ? pathname === "/"
                : portal === "listen"
                  ? pathname === exactPath || pathname.startsWith(`${exactPath}/`)
                  : pathname === exactPath
            );
            return (
              <Link
                key={href}
                href={href}
                className={`portal-sub-link relative flex shrink-0 items-center px-3 text-sm font-bold transition sm:px-4 ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
                {active && <span className="portal-sub-active absolute inset-x-3 bottom-0 h-1 rounded-t-full sm:inset-x-4" />}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/search"
          className="hidden min-h-11 shrink-0 items-center gap-2 self-center rounded-full bg-raised px-4 text-sm font-semibold text-ink-soft transition hover:bg-highlight hover:text-ink lg:flex"
        >
          <Search className="size-4.5" /> Search
        </Link>
      </div>
    </header>
  );
}
