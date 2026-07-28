"use client";

import {
  Compass,
  Crown,
  Disc3,
  Download,
  Heart,
  History,
  Home,
  Library,
  ListMusic,
  ListOrdered,
  MicVocal,
  Music2,
  Plus,
  Podcast,
  Radio,
  RadioTower,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/config/theme";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

function NavLink({
  href,
  icon: Icon,
  label,
  exact = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-card px-3 py-2.5 text-sm font-semibold transition-colors ${
        active ? "bg-highlight text-ink" : "text-ink-soft hover:text-ink"
      }`}
    >
      <Icon className={`size-5 ${active ? "text-accent" : ""}`} />
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const token = useAuth((s) => s.token);
  const entitlements = useAuth((s) => s.entitlements);
  const { openLoginPrompt, toggleQueuePanel } = useUi();
  const queuePanelOpen = useUi((s) => s.queuePanelOpen);

  return (
    <aside className="hidden w-(--sidebar-w) shrink-0 flex-col gap-2 overflow-hidden p-2 pr-0 lg:flex">
      {/* Brand — fixed at the top, never scrolls */}
      <div className="shrink-0 rounded-panel bg-elev px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative flex size-9 items-center justify-center rounded-full bg-accent">
            <RadioTower className="size-5 text-accent-fg" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-flag ring-2 ring-elev" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-bold tracking-tight">{BRAND.name}</span>
            <span className="block font-bangla text-[11px] text-ink-mute">{BRAND.nameBn}</span>
          </span>
        </Link>
      </div>

      {/* Everything below the brand scrolls together */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {/* Primary nav */}
        <nav className="shrink-0 rounded-panel bg-elev p-2">
          <NavLink href="/" icon={Home} label="Home" exact />
          <NavLink href="/search" icon={Search} label="Search" />
          <NavLink href="/browse" icon={Compass} label="Browse" exact />
          <NavLink href="/live" icon={Radio} label="Live Radio" />
        </nav>

        {/* Catalogue */}
        <nav className="shrink-0 rounded-panel bg-elev p-2">
          <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-mute">Catalogue</p>
          <NavLink href="/songs" icon={Music2} label="Songs" />
          <NavLink href="/albums" icon={Disc3} label="Albums" />
          <NavLink href="/artists" icon={MicVocal} label="Artists" />
          <NavLink href="/programmes" icon={RadioTower} label="Programmes" />
          <NavLink href="/podcasts" icon={Podcast} label="Podcasts" />
        </nav>

        {/* Library */}
        <div className="flex shrink-0 flex-col rounded-panel bg-elev p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <Link href="/library" className="flex items-center gap-3 text-sm font-semibold text-ink-soft transition hover:text-ink">
              <Library className="size-5" /> Your Library
            </Link>
            <button
              aria-label="Create playlist"
              onClick={() => !token && openLoginPrompt("Sign in to create playlists.")}
              className="rounded-full p-1.5 text-ink-mute transition hover:bg-highlight hover:text-ink"
            >
              {token ? (
                <Link href="/library?create=1" aria-label="Create playlist">
                  <Plus className="size-4.5" />
                </Link>
              ) : (
                <Plus className="size-4.5" />
              )}
            </button>
          </div>

          <div className="px-1">
            {token && (
              <>
                <NavLink href="/favorites" icon={Heart} label="Liked recordings" />
                <NavLink href="/history" icon={History} label="History" />
                <NavLink href="/playlists" icon={ListMusic} label="Playlists" />
                {/* Offline downloads are a Premium feature — hide the entry for free users. */}
                {entitlements?.is_premium && <NavLink href="/downloads" icon={Download} label="Downloads" />}
              </>
            )}
            {/* Queue works for everyone (local queue) — toggles the queue panel. */}
            <button
              onClick={toggleQueuePanel}
              aria-pressed={queuePanelOpen}
              className={`flex w-full items-center gap-4 rounded-card px-3 py-2.5 text-sm font-semibold transition-colors ${
                queuePanelOpen ? "bg-highlight text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              <ListOrdered className={`size-5 ${queuePanelOpen ? "text-accent" : ""}`} /> Queue
            </button>
          </div>

          {!token && (
            <div className="mx-2 mt-2 rounded-card bg-raised p-4">
              <p className="text-sm font-bold">Build your library</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Sign in to save favourites, follow artists and create playlists.
              </p>
              <Link
                href="/login"
                className="mt-3 inline-block rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-page transition hover:scale-105"
              >
                Sign in
              </Link>
            </div>
          )}

          {/* Premium upsell */}
          {!entitlements?.is_premium && (
            <Link
              href="/premium"
              className="group mx-2 mb-1 mt-2 flex items-center gap-3 rounded-card border border-premium/25 bg-premium/8 px-3 py-2.5 transition hover:border-premium/50"
            >
              <Crown className="size-4.5 text-premium" />
              <span className="text-xs font-bold text-premium">Go Premium — ad-free listening</span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
