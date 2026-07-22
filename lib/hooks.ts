"use client";

import useSWR from "swr";
import { get } from "./api";
import { useAuth } from "@/stores/auth";
import type {
  Album,
  Artist,
  AudioAsset,
  Comment,
  Episode,
  HistoryEntry,
  HomeResponse,
  Paginated,
  Plan,
  PaymentRecord,
  Playlist,
  PodcastChannel,
  PodcastEpisode,
  Programme,
  SearchResults,
  Song,
  SubscriptionStatus,
  Suggestion,
  Taxonomy,
} from "./types";

const fetcher = <T,>(path: string) => get<T>(path);

/**
 * Auth-aware SWR: the token becomes part of the cache key so member flags
 * (is_favorited / is_following) refresh on login/logout.
 */
export function useApi<T>(path: string | null) {
  const token = useAuth((s) => s.token);
  return useSWR<T>(path ? [path, token ?? "guest"] : null, ([p]: [string, string]) => fetcher<T>(p), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}

// ---- Discovery ----
export const useHome = () => useApi<HomeResponse>("/home");
export const useCategories = () => useApi<{ data: Taxonomy[] }>("/categories");
export const useGenres = () => useApi<{ data: Taxonomy[] }>("/genres");
export const useTrending = () => useApi<{ data: AudioAsset[] }>("/trending");
export const useNewReleases = () => useApi<{ data: AudioAsset[] }>("/new-releases");
export const useOnThisDay = () => useApi<{ date: string; data: AudioAsset[] }>("/on-this-day");
export const useEditorialPlaylists = () => useApi<{ data: Playlist[] }>("/editorial-playlists");

// ---- Search ----
export const useSearch = (q: string, type?: string) =>
  useApi<SearchResults>(q.trim() ? `/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ""}` : null);
export const useSuggestions = (q: string) =>
  useApi<{ data: Suggestion[] }>(q.trim().length >= 2 ? `/search/suggest?q=${encodeURIComponent(q)}` : null);

// ---- Catalogue ----
export const useSongs = (params = "") => useApi<Paginated<Song>>(`/songs${params}`);
export const useSong = (id: number | string) => useApi<{ data: Song }>(`/songs/${id}`);
export const useAlbums = (params = "") => useApi<Paginated<Album>>(`/albums${params}`);
export const useAlbum = (id: number | string) => useApi<{ data: Album }>(`/albums/${id}`);
export const useArtists = (params = "") => useApi<Paginated<Artist>>(`/artists${params}`);
export const useArtist = (id: number | string) =>
  useApi<{ data: Artist; songs: { data: Song[] }; albums: { data: Album[] } }>(`/artists/${id}`);
export const useProgrammes = (params = "") => useApi<Paginated<Programme>>(`/programmes${params}`);
export const useProgramme = (id: number | string) =>
  useApi<{ data: Programme; episodes: Paginated<Episode> }>(`/programmes/${id}`);
export const useEpisode = (id: number | string) => useApi<{ data: Episode }>(`/episodes/${id}`);
export const usePodcasts = (params = "") => useApi<Paginated<PodcastChannel>>(`/podcasts${params}`);
export const usePodcast = (id: number | string) =>
  useApi<{ data: PodcastChannel; episodes: Paginated<PodcastEpisode> }>(`/podcasts/${id}`);
export const usePodcastEpisode = (id: number | string) =>
  useApi<{ data: PodcastEpisode }>(`/podcast-episodes/${id}`);
export const useAsset = (id: number | string | null) =>
  useApi<{ data: AudioAsset }>(id ? `/assets/${id}` : null);
export const usePublicPlaylist = (id: number | string) => useApi<{ data: Playlist }>(`/playlists/${id}`);

// ---- Recommendations ----
export const useForYou = () =>
  useApi<{ personalized: boolean; reason?: string; data: AudioAsset[] }>("/recommendations/for-you");
export const useSimilar = (assetId: number | null) =>
  useApi<{ data: AudioAsset[] }>(assetId ? `/assets/${assetId}/similar` : null);

// ---- Library (auth) ----
function useAuthedApi<T>(path: string | null) {
  const token = useAuth((s) => s.token);
  return useApi<T>(token ? path : null);
}

export const useMyPlaylists = () => useAuthedApi<Paginated<Playlist>>("/me/playlists");
export const useMyPlaylist = (id: number | string) => useAuthedApi<{ data: Playlist }>(`/me/playlists/${id}`);
export const useFavorites = () =>
  useAuthedApi<{ data: AudioAsset[]; meta: { total: number } }>("/me/favorites");
export const useFollows = () =>
  useAuthedApi<{ data: Record<string, { type: string; id: number; name: string | null }[]> }>("/me/follows");
export const useHistory = () =>
  useAuthedApi<{ data: HistoryEntry[]; meta: { total: number } }>("/me/history");
export const useContinueListening = () =>
  useAuthedApi<{ data: HistoryEntry[] }>("/me/continue-listening");

// ---- Engagement ----
export const useComments = (assetId: number | null) =>
  useApi<Paginated<Comment>>(assetId ? `/assets/${assetId}/comments` : null);

// ---- Subscription ----
export const usePlans = () => useApi<{ data: Plan[] }>("/plans");
export const useSubscription = () => useAuthedApi<SubscriptionStatus>("/me/subscription");
export const usePayments = () => useAuthedApi<{ data: PaymentRecord[] }>("/me/payments");
