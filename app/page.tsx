"use client";

import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import SectionRow from "@/components/cards/SectionRow";
import Artwork from "@/components/ui/Artwork";
import { PlayCircle, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { BRAND } from "@/config/theme";
import { displayTitle, formatDuration } from "@/lib/format";
import { useContinueListening, useForYou, useHome } from "@/lib/hooks";
import { toTrack } from "@/lib/tracks";
import { useAuth } from "@/stores/auth";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";
import type { AudioAsset } from "@/lib/types";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late night listening";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const { data: home, isLoading } = useHome();
  const { data: forYou } = useForYou();
  const { data: continueListening } = useContinueListening();
  const user = useAuth((s) => s.user);
  const locale = useUi((s) => s.locale);
  const playTrack = usePlayer((s) => s.playTrack);

  const heroBanner = home?.banners?.[0];

  const resumeItems = useMemo(
    () => (continueListening?.data ?? []).filter((e) => e.asset),
    [continueListening],
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Hero banner */}
      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-panel" />
      ) : heroBanner ? (
        <section className="relative overflow-hidden rounded-panel border border-edge bg-raised">
          <div
            aria-hidden
            className="ambient-drift pointer-events-none absolute -right-24 -top-32 size-96 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--accent), transparent 70%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--flag-red), transparent 70%)" }}
          />
          <div className="relative flex flex-col gap-4 p-8 sm:p-10">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
              <Sparkles className="size-3.5" /> {BRAND.tagline}
            </p>
            <h1 className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              {locale === "bn" && heroBanner.title_bn ? heroBanner.title_bn : heroBanner.title}
            </h1>
            {heroBanner.subtitle && (
              <p className="max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">{heroBanner.subtitle}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                href={heroBanner.target_type === "url" && heroBanner.target_value ? heroBanner.target_value : "/browse"}
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-fg transition hover:scale-105 hover:bg-accent-hover"
              >
                <Play className="size-4 fill-current" /> Start listening
              </Link>
              <Link
                href="/browse"
                className="flex items-center gap-2 rounded-full border border-edge-strong px-6 py-2.5 text-sm font-bold transition hover:border-ink"
              >
                Explore the archive <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Continue listening */}
      {resumeItems.length > 0 && (
        <section>
          <SectionHeading title={`${greeting()}${user ? `, ${user.name.split(" ")[0]}` : ""}`} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {resumeItems.slice(0, 6).map(({ asset, progress_seconds }) => {
              const a = asset as AudioAsset;
              const track = toTrack(a);
              const pct = a.duration_seconds ? Math.min(100, (progress_seconds / a.duration_seconds) * 100) : 0;
              return (
                <div
                  key={a.id}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-card bg-raised transition hover:bg-highlight"
                >
                  <Artwork type="audio_asset" id={a.id} url={a.artwork_url} title={a.title} className="size-16 shrink-0 rounded-none" />
                  <div className="min-w-0 flex-1 py-2 pr-2">
                    <Link href={`/assets/${a.id}`} className="clamp-1 text-sm font-semibold hover:underline">
                      {displayTitle(a, locale)}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-mute">
                      {formatDuration(progress_seconds)} / {formatDuration(a.duration_seconds)} · resume
                    </p>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-sunken">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="pr-3 opacity-0 transition group-hover:opacity-100">
                    {track && (
                      <PlayCircle size="size-10" icon="size-4" onClick={() => playTrack(track, progress_seconds)} label={`Resume ${a.title}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Personalised row */}
      {forYou && forYou.data.length > 0 && (
        <SectionRow
          title={
            <span className="flex items-center gap-2">
              {forYou.personalized ? "Made for you" : "Popular right now"}
              {forYou.personalized && <Sparkles className="size-4 text-accent" />}
            </span>
          }
          items={forYou.data}
        />
      )}

      {/* Curated sections from the curation module */}
      {isLoading && (
        <>
          <SectionRow title="Loading" loading />
          <SectionRow title="Loading" loading />
        </>
      )}
      {home?.sections.map((section) => (
        <SectionRow
          key={section.id}
          title={locale === "bn" && section.title_bn ? section.title_bn : section.title}
          items={section.items}
        />
      ))}
    </div>
  );
}
