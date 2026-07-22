"use client";

import { History as HistoryIcon, Play } from "lucide-react";
import Link from "next/link";
import Artwork from "@/components/ui/Artwork";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { displayTitle, formatDuration, timeAgo } from "@/lib/format";
import { useHistory } from "@/lib/hooks";
import { toTrack } from "@/lib/tracks";
import { useAuth } from "@/stores/auth";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

export default function HistoryPage() {
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);
  const { data, isLoading } = useHistory();
  const playTrack = usePlayer((s) => s.playTrack);
  const locale = useUi((s) => s.locale);

  if (hydrated && !token) {
    return (
      <EmptyState
        icon={<HistoryIcon className="size-10" />}
        title="Listening history"
        subtitle="Sign in to sync your listening across devices."
        action={
          <Link href="/login" className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover">
            Sign in
          </Link>
        }
      />
    );
  }

  const entries = (data?.data ?? []).filter((e) => e.asset);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Listening history</h1>
        <p className="mt-1 text-sm text-ink-soft">{data?.meta.total ?? 0} plays, synced across your devices.</p>
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}

      {!isLoading && entries.length === 0 && (
        <EmptyState icon={<HistoryIcon className="size-10" />} title="Nothing played yet" subtitle="Your recent listening will appear here." />
      )}

      <div className="flex flex-col">
        {entries.map((entry, i) => {
          const asset = entry.asset!;
          const track = toTrack(asset);
          const pct = asset.duration_seconds
            ? Math.min(100, (entry.progress_seconds / asset.duration_seconds) * 100)
            : 0;
          return (
            <div key={`${asset.id}-${i}`} className="group flex items-center gap-4 rounded-card px-3 py-2.5 transition hover:bg-raised">
              <div className="relative shrink-0">
                <Artwork type="audio_asset" id={asset.id} url={asset.artwork_url} title={asset.title} className="size-12" />
                {track && (
                  <button
                    aria-label={`Resume ${asset.title}`}
                    onClick={() => playTrack(track, entry.completed ? 0 : entry.progress_seconds)}
                    className="absolute inset-0 hidden items-center justify-center rounded-card bg-black/55 group-hover:flex"
                  >
                    <Play className="size-5 fill-current" />
                  </button>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/assets/${asset.id}`} className="clamp-1 text-sm font-semibold hover:underline">
                  {displayTitle(asset, locale)}
                </Link>
                <p className="text-xs text-ink-mute">
                  {entry.completed
                    ? "Finished"
                    : `${formatDuration(entry.progress_seconds)} of ${formatDuration(asset.duration_seconds)}`}
                  {entry.last_played_at ? ` · ${timeAgo(entry.last_played_at)}` : ""}
                </p>
                {!entry.completed && pct > 0 && (
                  <div className="mt-1.5 h-1 w-full max-w-52 overflow-hidden rounded-full bg-sunken">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
