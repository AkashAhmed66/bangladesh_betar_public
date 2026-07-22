"use client";

import Artwork from "@/components/ui/Artwork";
import { artworkFor } from "@/lib/artwork";

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
    <header className="relative -mx-4 -mt-4 mb-6 overflow-hidden px-4 pb-6 pt-8 sm:-mx-6 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: `linear-gradient(180deg, ${art.from}66 0%, ${art.to}22 55%, transparent 100%)`,
        }}
      />
      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-end">
        <Artwork
          type={type}
          id={id}
          url={artworkUrl}
          title={title}
          className="aspect-square w-40 shadow-2xl shadow-black/60 sm:w-52"
          iconClassName="size-1/4"
          rounded={round ? "rounded-full" : "rounded-card"}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">{kicker}</p>
          <h1 className="mt-2 break-words font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
          {titleAlt && <p className="font-bangla mt-1 text-lg text-ink-soft">{titleAlt}</p>}
          {subtitle && <div className="mt-3 text-sm text-ink-soft">{subtitle}</div>}
          {meta && <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-mute">{meta}</div>}
        </div>
      </div>
      {actions && <div className="relative mt-6 flex flex-wrap items-center gap-4">{actions}</div>}
    </header>
  );
}
