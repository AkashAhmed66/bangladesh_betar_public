/** Stable pseudonymous id for guest playback analytics (FR-ANL-07). */
export function anonymousId(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "betar.anon";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `anon-${crypto.randomUUID()}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
