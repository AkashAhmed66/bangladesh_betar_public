"use client";

import { create } from "zustand";
import { resolveApiBase } from "@/lib/api";
import { deleteOffline, listOffline, requestPersistence, saveOffline, type OfflineMeta } from "@/lib/offline";
import type { PlayerTrack } from "./player";
import { currentEntitlements, useAuth } from "./auth";
import { useUi } from "./ui";

interface DownloadsState {
  records: Record<number, OfflineMeta>; // assetId -> metadata (downloaded)
  progress: Record<number, number>; // assetId -> 0..100 while downloading
  hydrated: boolean;

  hydrate: () => Promise<void>;
  download: (track: PlayerTrack) => Promise<void>;
  remove: (assetId: number) => Promise<void>;
  isDownloaded: (assetId: number) => boolean;
  isDownloading: (assetId: number) => boolean;
}

/** Rebuild a queue-ready PlayerTrack from a stored offline record. */
export function offlineToTrack(m: OfflineMeta): PlayerTrack {
  return {
    key: `${m.type}:${m.id}`,
    type: m.type as PlayerTrack["type"],
    id: m.id,
    assetId: m.assetId,
    title: m.title,
    titleBn: m.titleBn,
    subtitle: m.subtitle,
    artworkUrl: m.artworkUrl,
    duration: m.duration,
    isPremium: m.isPremium,
    href: m.href,
  };
}

export const useDownloads = create<DownloadsState>((set, get) => ({
  records: {},
  progress: {},
  hydrated: false,

  hydrate: async () => {
    try {
      const list = await listOffline();
      const records: Record<number, OfflineMeta> = {};
      for (const m of list) records[m.assetId] = m;
      set({ records, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  download: async (track) => {
    const s = get();
    if (s.records[track.assetId] || s.progress[track.assetId] != null) return; // already there / in flight

    // Premium-only feature.
    if (!currentEntitlements().offline_downloads) {
      useUi.getState().openUpgradePrompt({
        title: "Offline downloads are Premium",
        body: "Upgrade to download recordings and listen offline — no data, no buffering.",
      });
      return;
    }
    const token = useAuth.getState().token;
    if (!token) {
      useUi.getState().openLoginPrompt("Sign in with your Premium account to download for offline.");
      return;
    }

    set((st) => ({ progress: { ...st.progress, [track.assetId]: 0 } }));

    try {
      await requestPersistence();

      const res = await fetch(`${resolveApiBase()}/assets/${track.assetId}/download`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "audio/*" },
      });
      if (!res.ok) {
        throw new Error(res.status === 403 ? "premium-required" : `Download failed (${res.status})`);
      }

      const contentType = res.headers.get("Content-Type") || "audio/mpeg";
      const total = Number(res.headers.get("Content-Length")) || 0;
      const reader = res.body?.getReader();

      let blob: Blob;
      if (reader) {
        const chunks: BlobPart[] = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            if (total > 0) {
              const pct = Math.min(99, Math.round((received / total) * 100));
              set((st) => ({ progress: { ...st.progress, [track.assetId]: pct } }));
            }
          }
        }
        blob = new Blob(chunks, { type: contentType });
      } else {
        blob = await res.blob();
      }

      const meta: OfflineMeta = {
        assetId: track.assetId,
        type: track.type,
        id: track.id,
        title: track.title,
        titleBn: track.titleBn,
        subtitle: track.subtitle,
        artworkUrl: track.artworkUrl,
        duration: track.duration,
        isPremium: track.isPremium,
        href: track.href,
        size: blob.size,
        downloadedAt: Date.now(),
      };
      await saveOffline(meta, blob);

      set((st) => {
        const progress = { ...st.progress };
        delete progress[track.assetId];
        return { records: { ...st.records, [track.assetId]: meta }, progress };
      });
      useUi.getState().toast(`Downloaded “${track.title}” for offline.`, "success");
    } catch (e) {
      set((st) => {
        const progress = { ...st.progress };
        delete progress[track.assetId];
        return { progress };
      });
      const err = e as Error & { name?: string };
      if (err.message === "premium-required") {
        useUi.getState().openUpgradePrompt({
          title: "Offline downloads are Premium",
          body: "Upgrade to download recordings and listen offline — no data, no buffering.",
        });
      } else if (err.name === "QuotaExceededError" || /quota/i.test(err.message ?? "")) {
        useUi.getState().toast("Not enough storage for this download. Remove some downloads and try again.", "error");
      } else {
        useUi.getState().toast("Download failed. Check your connection and try again.", "error");
      }
    }
  },

  remove: async (assetId) => {
    try {
      await deleteOffline(assetId);
    } catch {
      /* ignore — still drop it from the UI */
    }
    set((st) => {
      const records = { ...st.records };
      delete records[assetId];
      return { records };
    });
    useUi.getState().toast("Removed from downloads.", "info");
  },

  isDownloaded: (assetId) => !!get().records[assetId],
  isDownloading: (assetId) => get().progress[assetId] != null,
}));
