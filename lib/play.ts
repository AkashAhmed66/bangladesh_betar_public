"use client";

import { get } from "./api";
import { playlistTracks, toTrack, toTracks } from "./tracks";
import type {
  Album,
  Artist,
  AudioAsset,
  CatalogueItem,
  Episode,
  Paginated,
  Playlist,
  PodcastChannel,
  PodcastEpisode,
  Programme,
  Song,
} from "./types";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

/**
 * Play any catalogue item. Direct playables start immediately; containers
 * (albums, playlists, artists, programmes, podcast channels) resolve their
 * track list first, then start from the top.
 */
export async function playItem(item: CatalogueItem): Promise<void> {
  const player = usePlayer.getState();

  const direct = toTrack(item);
  if (direct) {
    player.playTrack(direct);
    return;
  }

  try {
    switch (item.type) {
      case "album": {
        const res = await get<{ data: Album }>(`/albums/${item.id}`);
        const tracks = toTracks(res.data.tracks ?? []);
        if (tracks.length) player.playContext(tracks, 0, res.data.title);
        else notifyEmpty();
        return;
      }
      case "playlist": {
        const res = await get<{ data: Playlist }>(`/playlists/${item.id}`);
        const tracks = playlistTracks(res.data.items);
        if (tracks.length) player.playContext(tracks, 0, res.data.title);
        else notifyEmpty();
        return;
      }
      case "artist": {
        const res = await get<{ data: Artist; songs: { data: Song[] } }>(`/artists/${item.id}`);
        const tracks = toTracks(res.songs.data);
        if (tracks.length) player.playContext(tracks, 0, res.data.name);
        else notifyEmpty();
        return;
      }
      case "programme": {
        const res = await get<{ data: Programme; episodes: Paginated<Episode> }>(`/programmes/${item.id}`);
        const tracks = toTracks(res.episodes.data);
        if (tracks.length) player.playContext(tracks, 0, res.data.title);
        else notifyEmpty();
        return;
      }
      case "podcast_channel": {
        const res = await get<{ data: PodcastChannel; episodes: Paginated<PodcastEpisode> }>(`/podcasts/${item.id}`);
        const tracks = toTracks(res.episodes.data);
        if (tracks.length) player.playContext(tracks, 0, res.data.title);
        else notifyEmpty();
        return;
      }
      case "story": {
        // A story needs its parent episode's audio; resolve via the episode.
        const s = item as { episode_id?: number };
        if (!s.episode_id) return notifyEmpty();
        const res = await get<{ data: Episode }>(`/episodes/${s.episode_id}`);
        const track = toTrack(res.data);
        if (track) player.playTrack({ ...track, startAt: (item as { start_seconds?: number }).start_seconds ?? 0 });
        else notifyEmpty();
        return;
      }
      default: {
        const asset = item as AudioAsset;
        const track = toTrack(asset);
        if (track) player.playTrack(track);
        return;
      }
    }
  } catch {
    useUi.getState().toast("Could not start playback.", "error");
  }
}

function notifyEmpty() {
  useUi.getState().toast("Nothing streamable in this collection yet.", "info");
}
