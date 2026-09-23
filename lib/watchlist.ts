"use client";

import useSWR from "swr";
import { get } from "@/lib/api";
import type { WatchEpisode, WatchShow } from "@/lib/types";
import { useAuth } from "@/stores/auth";

export type WatchlistType = "watch_show" | "watch_episode";
export interface SavedEpisode extends WatchEpisode {
  show: Pick<WatchShow, "id" | "slug" | "title" | "title_bn" | "image_url">;
}
export type WatchlistEntry = {
  id: number;
  watchable_id: number;
  added_at: string;
} & ({ watchable_type: "watch_show"; item: WatchShow } | { watchable_type: "watch_episode"; item: SavedEpisode });
export interface WatchlistResponse { data: WatchlistEntry[] }

export function useWatchlist() {
  const token = useAuth((state) => state.token);
  return useSWR<WatchlistResponse>(token ? ["/me/watchlist", token] : null, ([path]: [string, string]) => get<WatchlistResponse>(path));
}
