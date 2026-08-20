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
import { portalForPath, type Portal } from "@/lib/portal";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

const PORTALS: { id: Portal; href: string; label: string; icon: typeof Newspaper }[] = [
  { id: "news", href: "/news", label: "News", icon: Newspaper },
  { id: "watch", href: "/watch", label: "Watch", icon: Clapperboard },
  { id: "listen", href: "/", label: "Listen", icon: Headphones },
];

const SUB_NAV: Record<Portal, { href: string; label: string; icon?: typeof Radio }[]> = {
  news: [
    { href: "/news", label: "Top stories" },
    { href: "/news#latest", label: "Latest" },
    { href: "/news#bangladesh", label: "Bangladesh" },
    { href: "/news#economy", label: "Economy" },
    { href: "/news#climate", label: "Climate" },
    { href: "/news#culture", label: "Culture" },
    { href: "/news#science", label: "Science" },
  ],
  watch: [
    { href: "/watch", label: "Home" },
    { href: "/watch#live", label: "Live TV" },
    { href: "/watch#drama", label: "Drama" },
    { href: "/watch#documentary", label: "Documentary" },
    { href: "/watch#culture", label: "Culture & music" },
    { href: "/watch#kids", label: "Kids" },
    { href: "/watch#categories", label: "Categories" },
  ],
  listen: [
    { href: "/", label: "Home" },
    { href: "/live", label: "Live radio", icon: Radio },
    { href: "/songs", label: "Songs", icon: Music2 },
    { href: "/albums", label: "Albums" },
    { href: "/artists", label: "Artists" },
    { href: "/programmes", label: "Programmes", icon: RadioTower },
    { href: "/podcasts", label: "Podcasts", icon: Podcast },
    { href: "/audiobooks", label: "Audio books", icon: BookOpen },
    { href: "/library", label: "My library", icon: Library },
  ],
};

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
  const locale = useUi((state) => state.locale);
  const setLocale = useUi((state) => state.setLocale);
  const toast = useUi((state) => state.toast);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [hiddenPath, setHiddenPath] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuOpen = menuPath === pathname;
  const headerHidden = hiddenPath === pathname;

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
    let animationFrame = 0;

    const updateHeader = () => {
      animationFrame = 0;
      const currentScrollTop = Math.max(0, scroller.scrollTop);
      const distance = currentScrollTop - lastScrollTop;

      if (menuOpen || currentScrollTop <= 12) {
        setHiddenPath(null);
        lastScrollTop = currentScrollTop;
        return;
      }

      if (distance > 6) {
        setHiddenPath(pathname);
        lastScrollTop = currentScrollTop;
      } else if (distance < -6) {
        setHiddenPath(null);
        lastScrollTop = currentScrollTop;
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
              <RadioTower className="size-5" />
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
          {SUB_NAV[portal].map(({ href, label }) => {
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
