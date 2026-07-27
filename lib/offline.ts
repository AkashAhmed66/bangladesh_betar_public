"use client";

/**
 * Offline audio storage (Premium "download for offline").
 *
 * Downloaded tracks are stored in IndexedDB across two object stores:
 *   - `meta`  : lightweight record per track (title, artwork, size…) — cheap to
 *               list for the Downloads page and for "is this downloaded?" checks.
 *   - `blobs` : the actual audio bytes ({ assetId, blob }) — read only when the
 *               track is played offline.
 * Keeping the bytes out of the metadata store means listing the library never
 * has to load hundreds of MB of audio into memory.
 */

const DB_NAME = "betar.offline";
const DB_VERSION = 1;
const META = "meta";
const BLOBS = "blobs";

export interface OfflineMeta {
  assetId: number;
  type: string;
  id: number;
  title: string;
  titleBn: string | null;
  subtitle: string;
  artworkUrl: string | null;
  duration: number | null;
  isPremium: boolean;
  href: string;
  size: number;
  downloadedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META, { keyPath: "assetId" });
      if (!db.objectStoreNames.contains(BLOBS)) db.createObjectStore(BLOBS, { keyPath: "assetId" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Could not open offline storage"));
  });
  return dbPromise;
}

/** Run a single-store request and resolve with its result. */
function request<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(db.transaction(store, mode).objectStore(store));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

/** Persist a track's metadata + audio bytes atomically. */
export async function saveOffline(meta: OfflineMeta, blob: Blob): Promise<void> {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction([META, BLOBS], "readwrite");
    tx.objectStore(META).put(meta);
    tx.objectStore(BLOBS).put({ assetId: meta.assetId, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error("Storage quota exceeded"));
  });
}

export async function deleteOffline(assetId: number): Promise<void> {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction([META, BLOBS], "readwrite");
    tx.objectStore(META).delete(assetId);
    tx.objectStore(BLOBS).delete(assetId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listOffline(): Promise<OfflineMeta[]> {
  const all = await request<OfflineMeta[]>(META, "readonly", (s) => s.getAll());
  return (all ?? []).sort((a, b) => b.downloadedAt - a.downloadedAt);
}

async function offlineBlob(assetId: number): Promise<Blob | null> {
  const rec = await request<{ assetId: number; blob: Blob } | undefined>(BLOBS, "readonly", (s) => s.get(assetId));
  return rec?.blob ?? null;
}

/** A short-lived object URL for the stored audio, or null if not downloaded. */
export async function offlineBlobUrl(assetId: number): Promise<string | null> {
  try {
    const blob = await offlineBlob(assetId);
    return blob ? URL.createObjectURL(blob) : null;
  } catch {
    return null;
  }
}

/** Ask the browser to keep our offline storage from being evicted. */
export async function requestPersistence(): Promise<void> {
  try {
    if (navigator.storage?.persist) await navigator.storage.persist();
  } catch {
    /* best effort */
  }
}
