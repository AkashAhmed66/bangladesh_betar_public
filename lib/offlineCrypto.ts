"use client";

/**
 * Key handling for download-protected offline saves.
 *
 * Secure contexts (HTTPS / localhost): the AES key is imported as a
 * NON-EXTRACTABLE WebCrypto key — it can decrypt segments but its raw bytes
 * can never be read back, not even from dev tools. The raw bytes are
 * discarded immediately after import.
 *
 * Insecure contexts (the plain-HTTP IP deployment): crypto.subtle does not
 * exist, so the key is stored XOR-wrapped with a deterministic keystream.
 * That is OBFUSCATION, not encryption — it stops casual inspection of
 * IndexedDB but not someone who reads this source. The full guarantee
 * arrives automatically once the site is served over HTTPS.
 */

import type { OfflineMeta } from "./offline";

export interface ParsedOfflinePlaylist {
  keyUrl: string | null;
  ivHex: string;
  segUrls: string[];
  /** m3u8 rewritten to offline:// URIs (EXT-X-KEY line retained). */
  template: string;
}

/** Rewrite a served playlist into its stored offline form. */
export function parseOfflinePlaylist(text: string, assetId: number): ParsedOfflinePlaylist {
  const segUrls: string[] = [];
  const out: string[] = [];
  let keyUrl: string | null = null;
  let ivHex = "00000000000000000000000000000000";

  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("#EXT-X-KEY")) {
      const uri = line.match(/URI="([^"]+)"/);
      if (uri) keyUrl = uri[1];
      const iv = line.match(/IV=0x([0-9a-fA-F]+)/);
      if (iv) ivHex = iv[1];
      out.push(line.replace(/URI="[^"]+"/, `URI="offline://${assetId}/key"`));
    } else if (line !== "" && !line.startsWith("#")) {
      out.push(`offline://${assetId}/seg/${segUrls.length}`);
      segUrls.push(line.trim());
    } else {
      out.push(line);
    }
  }

  return { keyUrl, ivHex, segUrls, template: out.join("\n") };
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

function subtle(): SubtleCrypto | null {
  return typeof crypto !== "undefined" && crypto.subtle ? crypto.subtle : null;
}

export async function importOfflineKey(
  raw: ArrayBuffer,
  assetId: number,
): Promise<{ keyMode: "webcrypto" | "wrapped"; key: CryptoKey | ArrayBuffer }> {
  const s = subtle();
  if (s) {
    const key = await s.importKey("raw", raw, { name: "AES-CBC" }, /* extractable */ false, ["decrypt"]);
    return { keyMode: "webcrypto", key };
  }
  return { keyMode: "wrapped", key: xorWrap(new Uint8Array(raw), assetId).buffer as ArrayBuffer };
}

export function unwrapOfflineKey(wrapped: ArrayBuffer, assetId: number): ArrayBuffer {
  return xorWrap(new Uint8Array(wrapped), assetId).buffer as ArrayBuffer;
}

/** Decrypt one stored segment with the non-extractable key (webcrypto mode). */
export async function decryptSegment(meta: OfflineMeta, buf: ArrayBuffer): Promise<ArrayBuffer> {
  const s = subtle();
  if (!s || !meta.key || !(meta.key instanceof CryptoKey)) throw new Error("offline key unavailable");
  return s.decrypt({ name: "AES-CBC", iv: hexToBytes(meta.ivHex ?? "") as BufferSource }, meta.key, buf);
}

// ---- HTTP-fallback key wrapping (symmetric XOR — obfuscation only) ----

function xorWrap(bytes: Uint8Array, assetId: number): Uint8Array {
  const ks = keystream(`betar-offline:${assetId}`, bytes.length);
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ ks[i];
  return out;
}

function keystream(seed: string, length: number): Uint8Array {
  let h = 2166136261; // FNV-1a seed
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out = new Uint8Array(length);
  let x = h || 1;
  for (let i = 0; i < length; i++) {
    // xorshift32
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    out[i] = x & 0xff;
  }
  return out;
}
