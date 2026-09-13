/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CENTRAL THEME CONFIGURATION (JS side)
 * ─────────────────────────────────────────────────────────────────────────
 *  Everything brand-related that lives in JavaScript: product naming and
 *  the generative artwork palette used for items without cover art.
 *
 *  The COLOR/FONT design tokens for the UI live in `app/globals.css`
 *  (single `:root` block at the top). Change colors there; change
 *  brand copy + artwork gradients here. Nothing else needs touching.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const BRAND = {
  name: "Bangladesh Betar",
  nameBn: "বাংলাদেশ বেতার",
  tagline: "News, stories and sound from Bangladesh",
  shortName: "Betar",
} as const;

/**
 * Gradient stops used to synthesise cover art for catalogue items that have
 * no artwork. A stable index is derived from the item's type+id, so every
 * item keeps the same identity in both modes. These are the rich, deep,
 * OLED-friendly dark variants; the daylight counterparts follow below.
 */
export const ARTWORK_GRADIENTS: readonly [string, string][] = [
  ["#0f4c3a", "#062b21"], // deep emerald
  ["#14532d", "#052e16"], // forest
  ["#7c2d12", "#3b0f06"], // burnt sienna
  ["#701a30", "#38091a"], // crimson velvet
  ["#1e3a8a", "#0c1b45"], // midnight blue
  ["#155e75", "#082f3b"], // deep teal
  ["#4c1d95", "#260c4d"], // royal violet
  ["#78350f", "#3d1a06"], // amber earth
  ["#134e4a", "#072a28"], // pine
  ["#581c87", "#2d0a47"], // aubergine
  ["#7f1d1d", "#420d0d"], // oxblood
  ["#3f3f46", "#18181b"], // graphite
] as const;

/** Daylight counterparts for generated covers. Indices match the dark palette. */
export const ARTWORK_LIGHT_GRADIENTS: readonly [string, string][] = [
  ["#d9f3e7", "#a9ddc5"], // mint emerald
  ["#e1f0d9", "#b8d8ae"], // soft forest
  ["#f8e0d2", "#e8bba3"], // warm peach
  ["#f5dbe2", "#e5aebd"], // soft rose
  ["#dce7fa", "#aec7ed"], // powder blue
  ["#d8f0f2", "#a7d8dd"], // pale teal
  ["#e8def8", "#c7b3e8"], // lavender
  ["#f8e8c8", "#e5c485"], // soft amber
  ["#d8efea", "#a7d7cc"], // sea glass
  ["#eee0f5", "#cfb5df"], // pale violet
  ["#f5dddd", "#e5b1b1"], // soft crimson
  ["#e7e8eb", "#c9ccd2"], // silver
] as const;

/** Accent hues paired with the gradients above for glows and highlights. */
export const ARTWORK_ACCENTS: readonly string[] = [
  "#34d399", "#4ade80", "#fb923c", "#fb7185", "#60a5fa", "#22d3ee",
  "#a78bfa", "#fbbf24", "#2dd4bf", "#c084fc", "#f87171", "#a1a1aa",
] as const;

/** Darker accents retain accessible definition against the daylight covers. */
export const ARTWORK_LIGHT_ACCENTS: readonly string[] = [
  "#007a46", "#3f7b47", "#a64b1d", "#9f3150", "#315fa8", "#197080",
  "#6941a5", "#966000", "#16756a", "#7a3a91", "#9b3434", "#59616c",
] as const;
