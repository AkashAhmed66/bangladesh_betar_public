"use client";

import { ChevronLeft, ChevronRight, Crown, Languages, LogOut, MessageSquareHeart, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, entitlements, logout } = useAuth();
  const locale = useUi((s) => s.locale);
  const setLocale = useUi((s) => s.setLocale);
  const toast = useUi((s) => s.toast);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 flex h-(--topbar-h) items-center gap-3 bg-elev/85 px-4 backdrop-blur-md sm:px-6">
      {/* history nav */}
      <div className="hidden items-center gap-2 sm:flex">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="rounded-full bg-sunken/80 p-1.5 text-ink-soft transition hover:text-ink"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => router.forward()}
          aria-label="Go forward"
          className="rounded-full bg-sunken/80 p-1.5 text-ink-soft transition hover:text-ink"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* quick search — hidden on the search page itself */}
      {pathname !== "/search" && (
        <button
          onClick={() => router.push("/search")}
          className="flex min-w-0 items-center gap-2 rounded-full bg-raised px-4 py-2 text-sm text-ink-mute transition hover:bg-highlight hover:text-ink-soft"
        >
          <Search className="size-4 shrink-0" />
          <span className="hidden truncate md:inline">Search songs, artists, programmes…</span>
        </button>
      )}

      <div className="flex-1" />

      {/* language toggle */}
      <button
        onClick={() => setLocale(locale === "en" ? "bn" : "en")}
        aria-label="Toggle language"
        className="flex items-center gap-1.5 rounded-full bg-raised px-3 py-1.5 text-xs font-bold text-ink-soft transition hover:text-ink"
        title="Switch title language"
      >
        <Languages className="size-4" />
        {locale === "en" ? "EN" : "বাং"}
      </button>

      {!entitlements?.is_premium && (
        <Link
          href="/premium"
          className="hidden items-center gap-1.5 rounded-full bg-premium px-4 py-1.5 text-xs font-bold text-premium-fg transition hover:scale-105 sm:flex"
        >
          <Crown className="size-3.5" /> Upgrade
        </Link>
      )}

      {token ? (
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-full bg-raised py-1 pl-1 pr-3 transition hover:bg-highlight"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-fg">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">{user?.name}</span>
          </button>
          {menuOpen && (
            <div className="fade-up absolute right-0 z-50 mt-2 w-56 rounded-panel border border-edge bg-raised p-1.5 shadow-2xl shadow-black/60">
              <div className="border-b border-edge px-3 py-2">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-ink-mute">{user?.email}</p>
                {entitlements?.is_premium && (
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-premium">
                    <Crown className="size-3" /> Premium member
                  </p>
                )}
              </div>
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft transition hover:bg-highlight hover:text-ink"
              >
                <User className="size-4" /> Account & subscription
              </Link>
              <Link
                href="/support"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft transition hover:bg-highlight hover:text-ink"
              >
                <MessageSquareHeart className="size-4" /> Feedback & support
              </Link>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                  toast("Signed out. See you soon!", "success");
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft transition hover:bg-highlight hover:text-ink"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/register" className="hidden px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:text-ink sm:block">
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-ink px-5 py-1.5 text-sm font-bold text-page transition hover:scale-105"
          >
            Log in
          </Link>
        </div>
      )}
    </header>
  );
}
