"use client";

import { Bookmark, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { post } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useWatchlist } from "@/lib/watchlist";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

interface WatchlistButtonProps {
  showId?: number;
  episodeId?: number;
  initial?: boolean;
  tone?: "dark" | "light";
  compact?: boolean;
}

export default function WatchlistButton({ showId, episodeId, initial = false, tone = "light", compact = false }: WatchlistButtonProps) {
  const { t } = useTranslation();
  const token = useAuth((state) => state.token);
  const openLoginPrompt = useUi((state) => state.openLoginPrompt);
  const toast = useUi((state) => state.toast);
  const { data, mutate } = useWatchlist();
  const { mutate: refresh } = useSWRConfig();
  const [busy, setBusy] = useState(false);
  const type = episodeId ? "watch_episode" : "watch_show";
  const id = episodeId ?? showId;
  const saved = Boolean(token && (data ? data.data.some((entry) => entry.watchable_type === type && entry.watchable_id === id) : initial));

  const toggle = async () => {
    if (!token) { openLoginPrompt(t("watch.signInToWatchlist")); return; }
    if (busy || !id) return;
    setBusy(true);
    try {
      const response = await post<{ watchlisted: boolean }>("/me/watchlist/toggle", { watchable_type: type, watchable_id: id });
      await mutate();
      void refresh((key) => Array.isArray(key) && String(key[0]).startsWith("/watch"));
      toast(t(response.watchlisted ? "watch.addedToWatchlist" : "watch.removedFromWatchlist"), "success");
    } catch { toast(t("watch.watchlistFailed"), "error"); }
    finally { setBusy(false); }
  };

  return (
    <button type="button" onClick={() => void toggle()} disabled={busy} aria-pressed={saved}
      aria-label={t(saved ? "watch.removeFromWatchlist" : "watch.addToWatchlist")}
      className={`inline-flex items-center justify-center gap-2 rounded-full border font-bold transition disabled:opacity-50 ${compact ? "min-h-10 px-3 text-xs" : "min-h-12 px-5 text-sm"} ${tone === "dark" ? "border-white/30 text-white hover:border-white hover:bg-white/10" : "border-edge text-ink-soft hover:border-[var(--portal-color)] hover:text-ink"}`}>
      {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />}
      {t(saved ? "watch.inWatchlist" : "watch.addToWatchlist")}
    </button>
  );
}
