"use client";

import Artwork from "@/components/ui/Artwork";
import { artworkCss, artworkFor } from "@/lib/artwork";

interface DetailHeroProps {
  type: string;
  id: number;
  artworkUrl?: string | null;
  kicker: string;                 // e.g. "Album", "Artist", "Programme"
  title: string;
  titleAlt?: string | null;       // other-language title
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  round?: boolean;
}

/** Shared page header: big artwork over an ambient glow, Spotify-style. */
export default function DetailHero({
  type, id, artworkUrl, kicker, title, titleAlt, subtitle, meta, actions, round,
}: DetailHeroProps) {
  const art = artworkFor(type, id);

  return (
    <header className="portal-full-bleed relative -mt-5 mb-10 min-h-[27rem] overflow-hidden border-b border-edge sm:-mt-7 sm:min-h-[31rem]">
      <div
        aria-hidden
        className="artwork-themed artwork-backdrop pointer-events-none absolute inset-0 scale-110 opacity-75 blur-2xl"
        style={artworkCss(art)}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--bg-elev)_4%,color-mix(in_srgb,var(--bg-elev)_82%,transparent)_55%,color-mix(in_srgb,var(--bg-elev)_55%,transparent)),linear-gradient(0deg,var(--bg-elev),transparent_70%)]" />
      <div className="relative mx-auto flex min-h-[27rem] max-w-[1540px] flex-col items-start justify-end gap-7 px-5 py-10 sm:min-h-[31rem] sm:flex-row sm:items-end sm:px-10 sm:py-14 lg:gap-12">
        <Artwork
          type={type}
          id={id}
          url={artworkUrl}
          title={title}
          className="aspect-square w-52 shadow-2xl shadow-shade/40 ring-1 ring-white/10 sm:w-64 lg:w-72"
          iconClassName="size-1/4"
          rounded={round ? "rounded-full" : "rounded-card"}
        />
        <div className="min-w-0 flex-1">
          <p className="inline-flex rounded-full border border-edge bg-elev/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--portal-color)] backdrop-blur">{kicker}</p>
          <h1 className="mt-4 max-w-4xl break-words font-display text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {titleAlt && <p className="font-bangla mt-2 text-xl text-ink-soft">{titleAlt}</p>}
          {subtitle && <div className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">{subtitle}</div>}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-ink-mute">{meta}</div>}
          {actions && <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
