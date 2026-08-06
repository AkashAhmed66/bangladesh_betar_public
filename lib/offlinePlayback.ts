"use client";

/**
 * Offline playback of download-protected saves.
 *
 * A custom hls.js loader resolves offline:// URLs from IndexedDB instead of
 * the network. Segments are stored AES-encrypted; in webcrypto mode each one
 * is decrypted in memory with the NON-EXTRACTABLE stored key just before
 * hls.js demuxes it (the playlist's key line is stripped, so hls.js never
 * sees a key). In the HTTP-fallback "wrapped" mode the playlist keeps its
 * key line pointing at offline://…/key and hls.js's own software decryptor
 * does the work. Plain audio never exists at rest on the device.
 */

import type { Loader, LoaderCallbacks, LoaderConfiguration, LoaderContext, LoaderStats } from "hls.js";
import { getOfflineMeta, getOfflineSegment } from "./offline";
import { decryptSegment, unwrapOfflineKey } from "./offlineCrypto";
import { registerHlsInstance } from "./hls";

function makeStats(): LoaderStats {
  return {
    aborted: false,
    loaded: 0,
    retry: 0,
    total: 0,
    chunkCount: 0,
    bwEstimate: 0,
    loading: { start: 0, first: 0, end: 0 },
    parsing: { start: 0, end: 0 },
    buffering: { start: 0, first: 0, end: 0 },
  };
}

class OfflineLoader implements Loader<LoaderContext> {
  context: LoaderContext = null as unknown as LoaderContext;

  stats: LoaderStats = makeStats();

  private aborted = false;

  destroy(): void {}

  abort(): void {
    this.aborted = true;
    this.stats.aborted = true;
  }

  load(context: LoaderContext, _config: LoaderConfiguration, callbacks: LoaderCallbacks<LoaderContext>): void {
    this.context = context;
    void this.resolve(context.url)
      .then((data) => {
        if (this.aborted) return;
        const now = performance.now();
        this.stats.loading = { start: now, first: now, end: now };
        this.stats.loaded = this.stats.total = typeof data === "string" ? data.length : data.byteLength;
        callbacks.onSuccess({ url: context.url, data }, this.stats, context, null);
      })
      .catch((e: unknown) => {
        if (this.aborted) return;
        callbacks.onError({ code: 0, text: String(e) }, context, null, this.stats);
      });
  }

  private async resolve(url: string): Promise<string | ArrayBuffer> {
    const m = url.match(/^offline:\/\/(\d+)\/(playlist|key|seg\/(\d+))$/);
    if (!m) throw new Error(`not an offline url: ${url}`);
    const assetId = Number(m[1]);

    const meta = await getOfflineMeta(assetId);
    if (!meta || meta.kind !== "hls" || !meta.playlist) throw new Error("offline copy missing");

    if (m[2] === "playlist") {
      // webcrypto mode: we decrypt segments ourselves, so hls.js must not
      // see the key line at all.
      return meta.keyMode === "webcrypto"
        ? meta.playlist.split("\n").filter((l) => !l.startsWith("#EXT-X-KEY")).join("\n")
        : meta.playlist;
    }

    if (m[2] === "key") {
      if (meta.keyMode !== "wrapped" || !(meta.key instanceof ArrayBuffer)) throw new Error("no offline key");
      return unwrapOfflineKey(meta.key, assetId);
    }

    const index = Number(m[3]);
    const buf = await getOfflineSegment(assetId, index);
    if (!buf) throw new Error(`offline segment ${index} missing`);
    return meta.keyMode === "webcrypto" ? decryptSegment(meta, buf) : buf;
  }
}

/** Wire an element to a saved offline package and register the instance. */
export async function attachOfflineHls(el: HTMLMediaElement, assetId: number): Promise<void> {
  const { default: Hls } = await import("hls.js");
  if (!Hls.isSupported()) throw new Error("Offline playback needs Media Source Extensions.");

  const hls = new Hls({
    enableWorker: false,
    loader: OfflineLoader as unknown as typeof Hls.DefaultConfig.loader,
  });
  hls.on(Hls.Events.ERROR, (_event, data) => {
    if (data.fatal) {
      hls.destroy();
      el.dispatchEvent(new Event("error"));
    }
  });
  // Register first: this destroys any previous instance BEFORE the new one
  // claims the media element.
  registerHlsInstance(el, hls);
  hls.loadSource(`offline://${assetId}/playlist`);
  hls.attachMedia(el);
}
