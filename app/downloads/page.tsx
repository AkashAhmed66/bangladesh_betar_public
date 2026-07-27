"use client";

import { Crown, HardDriveDownload, Play } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import TrackTable from "@/components/cards/TrackTable";
import { EmptyState } from "@/components/ui/Misc";
import { useAuth } from "@/stores/auth";
import { offlineToTrack, useDownloads } from "@/stores/downloads";
import { usePlayer } from "@/stores/player";

function humanSize(bytes: number): string {
  if (!bytes) return "0 MB";
  const units = ["KB", "MB", "GB"];
  let n = bytes / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 || n >= 100 ? 0 : 1)} ${units[i]}`;
}

export default function DownloadsPage() {
  const records = useDownloads((s) => s.records);
  const removeDownload = useDownloads((s) => s.remove);
  const hydrated = useDownloads((s) => s.hydrated);
  const playContext = usePlayer((s) => s.playContext);
  const isPremium = useAuth((s) => s.entitlements?.is_premium ?? false);
  const token = useAuth((s) => s.token);

  const metas = useMemo(
    () => Object.values(records).sort((a, b) => b.downloadedAt - a.downloadedAt),
    [records],
  );
  const tracks = useMemo(() => metas.map(offlineToTrack), [metas]);
  const totalBytes = useMemo(() => metas.reduce((sum, m) => sum + (m.size || 0), 0), [metas]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="flex size-40 shrink-0 items-center justify-center rounded-panel bg-gradient-to-br from-accent/30 to-accent/5 shadow-xl sm:size-48">
          <HardDriveDownload className="size-16 text-accent" />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">Available offline</span>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Downloads</h1>
          <p className="text-sm text-ink-soft">
            {metas.length > 0
              ? `${metas.length} recording${metas.length === 1 ? "" : "s"} · ${humanSize(totalBytes)} stored on this device`
              : "Downloaded recordings play here without using data."}
          </p>
          {tracks.length > 0 && (
            <button
              onClick={() => playContext(tracks, 0, "Downloads")}
              className="mt-1 inline-flex w-fit items-center gap-2.5 rounded-full bg-accent px-7 py-3 text-sm font-bold text-accent-fg transition hover:scale-105 hover:bg-accent-hover"
            >
              <Play className="size-5 fill-current" /> Play all
            </button>
          )}
        </div>
      </div>

      {/* List / empty states */}
      {tracks.length > 0 ? (
        <TrackTable
          tracks={tracks}
          contextLabel="Downloads"
          onRemove={(index) => removeDownload(metas[index].assetId)}
        />
      ) : !hydrated ? null : !token || !isPremium ? (
        <EmptyState
          icon={<Crown className="size-10 text-premium" />}
          title="Offline listening is a Premium feature"
          subtitle="Go Premium to download recordings and play them offline — no data, no buffering."
          action={
            <Link
              href="/premium"
              className="mt-2 inline-block rounded-full bg-premium px-6 py-2.5 text-sm font-bold text-premium-fg transition hover:scale-105"
            >
              Explore Premium
            </Link>
          }
        />
      ) : (
        <EmptyState
          icon={<HardDriveDownload className="size-10" />}
          title="No downloads yet"
          subtitle="Open the ⋯ menu on any song or recording and choose “Download for offline”. It’ll appear here, ready to play without a connection."
        />
      )}
    </div>
  );
}
