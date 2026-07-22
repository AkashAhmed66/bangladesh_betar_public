import { ARTWORK_ACCENTS, ARTWORK_GRADIENTS } from "@/config/theme";

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
  /** Angle in degrees for the gradient. */
  angle: number;
}

export function artworkFor(type: string, id: number): GeneratedArt {
  const h = hash(`${type}:${id}`);
  const idx = h % ARTWORK_GRADIENTS.length;
  const [from, to] = ARTWORK_GRADIENTS[idx];
  return {
    from,
    to,
    accent: ARTWORK_ACCENTS[idx],
    angle: 115 + (h % 6) * 25,
  };
}

export function artworkCss(art: GeneratedArt): React.CSSProperties {
  return {
    background: `radial-gradient(120% 120% at 20% 10%, ${art.accent}26 0%, transparent 45%), linear-gradient(${art.angle}deg, ${art.from} 0%, ${art.to} 100%)`,
  };
}
