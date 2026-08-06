"use client";

import { create } from "zustand";
import { resolveApiBase } from "@/lib/api";
import {
  deleteOffline,
  listOffline,
  putOfflineSegment,
  requestPersistence,
  saveOfflineMeta,
  type OfflineMeta,
} from "@/lib/offline";
import { importOfflineKey, parseOfflinePlaylist } from "@/lib/offlineCrypto";
import type { PlayerTrack } from "./player";
import { currentEntitlements, useAuth } from "./auth";
import { useUi } from "./ui";

interface DownloadsState {
  records: Record<number, OfflineMeta>; // assetId -> metadata (saved)
  progress: Record<number, number>; // assetId -> 0..100 while saving
  hydrated: boolean;

  hydrate: () => Promise<void>;
  download: (track: PlayerTrack) => Promise<void>;
  remove: (assetId: number) => Promise<void>;
  isDownloaded: (assetId: number) => boolean;
  isDownloading: (assetId: number) => boolean;
}

/** Renew licenses that expire within this window whenever we're online. */
const RENEW_WINDOW_MS = 7 * 864e5;

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

/**
 * Fetch one encrypted segment, waiting out 429s from the streaming rate
 * limiter (saves share the same throttled segment route as playback, so a
 * long recording deliberately takes a few minutes to save).
 */
async function fetchSegment(url: string): Promise<ArrayBuffer> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      const wait = Number(res.headers.get("Retry-After")) || 15;
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`segment ${res.status}`);
    return res.arrayBuffer();
  }
  throw new Error("segment retry limit reached");
}

export const useDownloads = create<DownloadsState>((set, get) => ({
  records: {},
  progress: {},
  hydrated: false,

  hydrate: async () => {
    try {
      const list = await listOffline();
      const now = Date.now();
      const records: Record<number, OfflineMeta> = {};
      for (const m of list) {
        // Hard-expired licenses are purged, not listed.
        if (m.kind === "hls" && m.expiresAt && m.expiresAt < now) {
          void deleteOffline(m.assetId).catch(() => undefined);
          continue;
        }
        records[m.assetId] = m;
      }
      set({ records, hydrated: true });
      void renewLicenses(Object.values(records), set);
    } catch {
      set({ hydrated: true });
    }
  },

  /**
   * Save for offline listening — download-protected: stores the recording's
   * AES-encrypted HLS segments plus a non-extractable (or, on plain HTTP,
   * wrapped) key. No decodable audio file ever touches the device.
   */
  download: async (track) => {
    const s = get();
    if (s.records[track.assetId] || s.progress[track.assetId] != null) return; // already there / in flight

    if (!currentEntitlements().offline_downloads) {
      useUi.getState().openUpgradePrompt({
        title: "Offline listening is Premium",
        body: "Upgrade to save recordings and listen offline — no data, no buffering.",
      });
      return;
    }
    const token = useAuth.getState().token;
    if (!token) {
      useUi.getState().openLoginPrompt("Sign in with your Premium account to save recordings offline.");
      return;
    }

    set((st) => ({ progress: { ...st.progress, [track.assetId]: 0 } }));

    try {
      await requestPersistence();

      // 1. The premium-gated manifest → signed playlist URL + license terms.
      const mRes = await fetch(`${resolveApiBase()}/assets/${track.assetId}/offline-manifest`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (mRes.status === 425) throw new Error("preparing");
      if (!mRes.ok) throw new Error(mRes.status === 403 ? "premium-required" : `manifest ${mRes.status}`);
      const manifest = (await mRes.json()) as { playlist_url: string; license_days?: number };

      // 2. The playlist: segment URLs + key URL + IV, rewritten for storage.
      const plRes = await fetch(manifest.playlist_url);
      if (!plRes.ok) throw new Error(`playlist ${plRes.status}`);
      const parsed = parseOfflinePlaylist(await plRes.text(), track.assetId);
      if (!parsed.keyUrl || parsed.segUrls.length === 0) throw new Error("unusable playlist");

      // 3. The key — imported as a non-extractable CryptoKey where possible;
      //    the raw bytes are never stored.
      const keyRes = await fetch(parsed.keyUrl);
      if (!keyRes.ok) throw new Error(`key ${keyRes.status}`);
      const { keyMode, key } = await importOfflineKey(await keyRes.arrayBuffer(), track.assetId);

      // 4. Every encrypted segment, stored as-is (ciphertext at rest).
      let size = 0;
      for (let i = 0; i < parsed.segUrls.length; i++) {
        const buf = await fetchSegment(parsed.segUrls[i]);
        size += buf.byteLength;
        await putOfflineSegment(track.assetId, i, buf);
        const pct = Math.min(99, Math.round(((i + 1) / parsed.segUrls.length) * 100));
        set((st) => ({ progress: { ...st.progress, [track.assetId]: pct } }));
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
        size,
        downloadedAt: Date.now(),
        kind: "hls",
        playlist: parsed.template,
        ivHex: parsed.ivHex,
        keyMode,
        key,
        segCount: parsed.segUrls.length,
        expiresAt: Date.now() + (manifest.license_days ?? 30) * 864e5,
      };
      await saveOfflineMeta(meta);

      set((st) => {
        const progress = { ...st.progress };
        delete progress[track.assetId];
        return { records: { ...st.records, [track.assetId]: meta }, progress };
      });
      useUi.getState().toast(`Saved “${track.title}” for offline listening (encrypted).`, "success");
    } catch (e) {
      // Drop any partially-stored segments.
      void deleteOffline(track.assetId).catch(() => undefined);
      set((st) => {
        const progress = { ...st.progress };
        delete progress[track.assetId];
        return { progress };
      });
      const err = e as Error & { name?: string };
      if (err.message === "premium-required") {
        useUi.getState().openUpgradePrompt({
          title: "Offline listening is Premium",
          body: "Upgrade to save recordings and listen offline — no data, no buffering.",
        });
      } else if (err.message === "preparing") {
        useUi.getState().toast("This recording is being prepared for offline listening — try again in a minute.", "info");
      } else if (err.name === "QuotaExceededError" || /quota/i.test(err.message ?? "")) {
        useUi.getState().toast("Not enough storage for this save. Remove some saved recordings and try again.", "error");
      } else {
        useUi.getState().toast("Saving failed. Check your connection and try again.", "error");
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
    useUi.getState().toast("Removed from saved recordings.", "info");
  },

  isDownloaded: (assetId) => !!get().records[assetId],
  isDownloading: (assetId) => get().progress[assetId] != null,
}));

/**
 * Silent license renewal: while the account still has the offline
 * entitlement, saved copies never lapse; on a lost/lapsed account they age
 * out at their stored expiry.
 */
async function renewLicenses(
  records: OfflineMeta[],
  set: (fn: (st: { records: Record<number, OfflineMeta> }) => { records: Record<number, OfflineMeta> }) => void,
): Promise<void> {
  const token = useAuth.getState().token;
  if (!token || (typeof navigator !== "undefined" && !navigator.onLine)) return;

  const soon = Date.now() + RENEW_WINDOW_MS;
  for (const m of records) {
    if (m.kind !== "hls" || !m.expiresAt || m.expiresAt > soon) continue;
    try {
      const res = await fetch(`${resolveApiBase()}/assets/${m.assetId}/offline-manifest?renew=1`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) continue; // lapsed plan → the copy ages out naturally
      const body = (await res.json()) as { license_days?: number };
      const renewed = { ...m, expiresAt: Date.now() + (body.license_days ?? 30) * 864e5 };
      await saveOfflineMeta(renewed);
      set((st) => ({ records: { ...st.records, [m.assetId]: renewed } }));
    } catch {
      /* offline or transient — retry next hydrate */
    }
  }
}
