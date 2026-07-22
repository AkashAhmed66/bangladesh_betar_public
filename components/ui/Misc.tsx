"use client";

import { Crown, Play } from "lucide-react";

/** Spotify-style circular accent play button that lifts on hover. */
export function PlayCircle({
  onClick,
  size = "size-12",
  icon = "size-5",
  className = "",
  label = "Play",
}: {
  onClick: (e: React.MouseEvent) => void;
  size?: string;
  icon?: string;
  className?: string;
  label?: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
      className={`flex ${size} items-center justify-center rounded-full bg-accent text-accent-fg shadow-lg shadow-black/40 transition-all hover:scale-105 hover:bg-accent-hover active:scale-95 ${className}`}
    >
      <Play className={`${icon} translate-x-[1px] fill-current`} />
    </button>
  );
}

export function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-premium/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-premium ${className}`}
    >
      <Crown className="size-3" /> Premium
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-card bg-raised ${className}`} />;
}

export function SectionHeading({
  title,
  action,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-edge py-16 text-center">
      {icon && <div className="text-ink-mute">{icon}</div>}
      <p className="font-display text-lg font-semibold">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-ink-soft">{subtitle}</p>}
      {action}
    </div>
  );
}
