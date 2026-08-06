"use client";

/**
 * Offline audio storage (Premium "save for offline listening").
 *
 * v2 — download-protected: a saved recording is its ENCRYPTED HLS package.
 * IndexedDB object stores:
 *   - `meta`     : one record per track — display fields plus the offline
 *                  playlist template, the AES key (a NON-EXTRACTABLE
 *                  CryptoKey on secure contexts — usable to decrypt, never
 *                  readable), the IV, and a license expiry.
 *   - `segments` : the AES-128-encrypted .ts chunks, keyed "assetId:index".
 *                  The bytes at rest on the device are always ciphertext.
 *   - `blobs`    : legacy v1 plain-file saves — still playable/removable,
 *                  but nothing writes here any more.
 */

const DB_NAME = "betar.offline";
const DB_VERSION = 2;
const META = "meta";
const BLOBS = "blobs";
const SEGMENTS = "segments";

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

  // ---- v2 encrypted-HLS fields (absent on legacy blob records) ----
  kind?: "hls";
  /** m3u8 with offline:// URIs; the EXT-X-KEY line is kept and stripped at
   *  play time when the key is a WebCrypto CryptoKey. */
  playlist?: string;
  ivHex?: string;
  /** "webcrypto": non-extractable CryptoKey (secure contexts). "wrapped":
   *  obfuscated raw bytes — the HTTP fallback, see lib/offlineCrypto. */
  keyMode?: "webcrypto" | "wrapped";
  key?: CryptoKey | ArrayBuffer;
  segCount?: number;
  /** License expiry (ms) — renewed silently while the plan allows it. */
  expiresAt?: number;
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
      if (!db.objectStoreNames.contains(SEGMENTS)) db.createObjectStore(SEGMENTS, { keyPath: "key" });
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

const segKey = (assetId: number, index: number) => `${assetId}:${String(index).padStart(5, "0")}`;

export async function putOfflineSegment(assetId: number, index: number, buf: ArrayBuffer): Promise<void> {
  await request(SEGMENTS, "readwrite", (s) => s.put({ key: segKey(assetId, index), buf }));
}

export async function getOfflineSegment(assetId: number, index: number): Promise<ArrayBuffer | null> {
  const rec = await request<{ key: string; buf: ArrayBuffer } | undefined>(SEGMENTS, "readonly", (s) =>
    s.get(segKey(assetId, index)),
  );
  return rec?.buf ?? null;
}

export async function saveOfflineMeta(meta: OfflineMeta): Promise<void> {
  await request(META, "readwrite", (s) => s.put(meta));
}

export async function getOfflineMeta(assetId: number): Promise<OfflineMeta | null> {
  const rec = await request<OfflineMeta | undefined>(META, "readonly", (s) => s.get(assetId));
  return rec ?? null;
}

/** Remove a saved track entirely: meta + legacy blob + every segment. */
export async function deleteOffline(assetId: number): Promise<void> {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction([META, BLOBS, SEGMENTS], "readwrite");
    tx.objectStore(META).delete(assetId);
    tx.objectStore(BLOBS).delete(assetId);
    tx.objectStore(SEGMENTS).delete(IDBKeyRange.bound(`${assetId}:`, `${assetId}:￿`));
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

/** A short-lived object URL for a LEGACY (v1 plain blob) save, or null. */
export async function offlineBlobUrl(assetId: number): Promise<string | null> {
  try {
    const blob = await offlineBlob(assetId);
    return blob ? URL.createObjectURL(blob) : null;
  } catch {
    return null;
  }
}

/**
 * How to play this asset offline, if saved: encrypted-HLS package (v2),
 * legacy blob (v1), or null. Expired licenses are purged on sight.
 */
export async function offlineSource(
  assetId: number,
): Promise<{ kind: "hls" } | { kind: "blob"; url: string } | null> {
  try {
    const meta = await getOfflineMeta(assetId);
    if (!meta) return null;
    if (meta.kind === "hls") {
      if (meta.expiresAt && Date.now() > meta.expiresAt) {
        void deleteOffline(assetId).catch(() => undefined);
        return null;
      }
      return { kind: "hls" };
    }
    const url = await offlineBlobUrl(assetId);
    return url ? { kind: "blob", url } : null;
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
