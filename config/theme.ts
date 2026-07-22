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
  name: "Betar Tarango",
  nameBn: "বেতার তরঙ্গ",
  tagline: "The sound archive of Bangladesh Betar",
  shortName: "Tarango",
} as const;

/**
 * Gradient stops used to synthesise cover art for catalogue items that have
 * no artwork. A stable index is derived from the item's type+id, so every
 * item keeps the same cover forever. Keep these dark-luxury: rich, deep,
 * OLED-friendly.
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

/** Accent hues paired with the gradients above for glows and highlights. */
export const ARTWORK_ACCENTS: readonly string[] = [
  "#34d399", "#4ade80", "#fb923c", "#fb7185", "#60a5fa", "#22d3ee",
  "#a78bfa", "#fbbf24", "#2dd4bf", "#c084fc", "#f87171", "#a1a1aa",
] as const;
