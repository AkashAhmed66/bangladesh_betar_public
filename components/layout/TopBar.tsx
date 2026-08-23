"use client";

import { ChevronLeft, ChevronRight, Crown, Languages, LogOut, MessageSquareHeart, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTranslation } from "@/lib/i18n";

export default function TopBar() {
  const { t } = useTranslation();
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
    <header className="sticky top-0 z-40 flex h-(--topbar-h) min-w-0 items-center gap-2 bg-elev/85 px-3 backdrop-blur-md sm:gap-3 sm:px-6">
      {/* history nav */}
      <div className="hidden items-center gap-2 sm:flex">
        <button
          onClick={() => router.back()}
          aria-label={t("shell.goBack")}
          className="rounded-full bg-sunken/80 p-1.5 text-ink-soft transition hover:text-ink"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={() => router.forward()}
          aria-label={t("shell.goForward")}
          className="rounded-full bg-sunken/80 p-1.5 text-ink-soft transition hover:text-ink"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* quick search — hidden on the search page itself */}
      {pathname !== "/search" && (
        <button
          onClick={() => router.push("/search")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-raised text-sm text-ink-mute transition hover:bg-highlight hover:text-ink-soft md:h-auto md:w-auto md:justify-start md:px-4 md:py-2"
        >
          <Search className="size-4 shrink-0" />
          <span className="hidden truncate md:inline">{t("shell.searchPlaceholder")}</span>
        </button>
      )}

      <div className="flex-1" />

      <ThemeToggle compact />

      {/* language toggle */}
      <button
        onClick={() => setLocale(locale === "en" ? "bn" : "en")}
        aria-label={t("shell.toggleLanguage")}
        className="flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-raised px-2.5 py-1.5 text-xs font-bold text-ink-soft transition hover:text-ink sm:gap-1.5 sm:px-3"
        title={t("shell.switchTitleLanguage")}
      >
        <Languages className="size-4" />
        {locale === "en" ? "EN" : "বাং"}
      </button>

      {!entitlements?.is_premium && (
        <Link
          href="/premium"
          className="hidden items-center gap-1.5 rounded-full bg-premium px-4 py-1.5 text-xs font-bold text-premium-fg transition hover:scale-105 sm:flex"
        >
          <Crown className="size-3.5" /> {t("shell.upgrade")}
        </Link>
      )}

      {token ? (
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            className="flex min-h-10 items-center gap-2 rounded-full bg-raised p-1 transition hover:bg-highlight md:pr-3"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-fg">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">{user?.name}</span>
          </button>
          {menuOpen && (
            <div className="fade-up absolute right-0 z-50 mt-2 w-[min(14rem,calc(100vw-1.5rem))] rounded-panel border border-edge bg-raised p-1.5 shadow-2xl shadow-shade/35">
              <div className="border-b border-edge px-3 py-2">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-ink-mute">{user?.email}</p>
                {entitlements?.is_premium && (
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-premium">
                    <Crown className="size-3" /> {t("common.premiumMember")}
                  </p>
                )}
              </div>
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft transition hover:bg-highlight hover:text-ink"
              >
                <User className="size-4" /> {t("shell.accountSubscription")}
              </Link>
              <Link
                href="/support"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft transition hover:bg-highlight hover:text-ink"
              >
                <MessageSquareHeart className="size-4" /> {t("shell.feedbackSupport")}
              </Link>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await logout();
                  toast(t("common.signedOut"), "success");
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-soft transition hover:bg-highlight hover:text-ink"
              >
                <LogOut className="size-4" /> {t("common.signOut")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/register" className="hidden px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:text-ink sm:block">
            {t("shell.signUp")}
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-page transition hover:scale-105 sm:px-5"
          >
            {t("common.login")}
          </Link>
        </div>
      )}
    </header>
  );
}
