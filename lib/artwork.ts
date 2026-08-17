import {
  ARTWORK_ACCENTS,
  ARTWORK_GRADIENTS,
  ARTWORK_LIGHT_ACCENTS,
  ARTWORK_LIGHT_GRADIENTS,
} from "@/config/theme";

/**
 * Deterministic generative cover art. The archive has few uploaded covers,
 * so items without artwork get a stable, rich gradient identity derived
 * from their type + id — the same item always renders the same cover.
 */

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
}

export interface GeneratedArt {
  from: string;
  to: string;
  accent: string;
  lightFrom: string;
  lightTo: string;
  lightAccent: string;
  /** Angle in degrees for the gradient. */
  angle: number;
}

export function artworkFor(type: string, id: number): GeneratedArt {
  const h = hash(`${type}:${id}`);
  const idx = h % ARTWORK_GRADIENTS.length;
  const [from, to] = ARTWORK_GRADIENTS[idx];
  const [lightFrom, lightTo] = ARTWORK_LIGHT_GRADIENTS[idx];
  return {
    from,
    to,
    accent: ARTWORK_ACCENTS[idx],
    lightFrom,
    lightTo,
    lightAccent: ARTWORK_LIGHT_ACCENTS[idx],
    angle: 115 + (h % 6) * 25,
  };
}

export function artworkCss(art: GeneratedArt): React.CSSProperties {
  return {
    "--artwork-from-dark": art.from,
    "--artwork-to-dark": art.to,
    "--artwork-accent-dark": art.accent,
    "--artwork-from-light": art.lightFrom,
    "--artwork-to-light": art.lightTo,
    "--artwork-accent-light": art.lightAccent,
    "--artwork-angle": `${art.angle}deg`,
  } as React.CSSProperties;
}
