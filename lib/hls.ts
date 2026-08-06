import type HlsType from "hls.js";

/**
 * Attach a source to an <audio> element, transparently handling encrypted
 * HLS (download protection). Plain URLs (previews, offline blobs, ads,
 * not-yet-packaged fallbacks) are set directly; `.m3u8` playlists are wired
 * through hls.js (or native HLS on Safari). One hls.js instance is tracked
 * per element and destroyed on every source change.
 */
const instances = new WeakMap<HTMLMediaElement, HlsType>();

/** Track an hls.js instance for an element, destroying any previous one. */
export function registerHlsInstance(el: HTMLMediaElement, hls: HlsType): void {
  detachAudioSource(el);
  instances.set(el, hls);
}

export async function attachAudioSource(el: HTMLMediaElement, url: string): Promise<void> {
  detachAudioSource(el);

  if (url.includes(".m3u8")) {
    const { default: Hls } = await import("hls.js");
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          hls.destroy();
          instances.delete(el);
          el.dispatchEvent(new Event("error"));
        }
      });
      hls.loadSource(url);
      hls.attachMedia(el);
      instances.set(el, hls);
      return;
    }
    if (el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = url;
      return;
    }
  }

  el.src = url;
}

export function detachAudioSource(el: HTMLMediaElement): void {
  const prev = instances.get(el);
  if (prev) {
    try {
      prev.destroy();
    } catch {
      /* already destroyed */
    }
    instances.delete(el);
  }
}
