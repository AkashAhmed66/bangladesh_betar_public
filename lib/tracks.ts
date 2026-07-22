import type { PlayerTrack } from "@/stores/player";
import { itemHref } from "./format";
import type {
  AudioAsset,
  CatalogueItem,
  Episode,
  PlaylistItem,
  PodcastEpisode,
  Song,
  Story,
} from "./types";

/**
 * Convert catalogue objects into queue-ready PlayerTracks.
 * Returns null for things that aren't directly streamable (artists, albums…).
 */
export function toTrack(item: CatalogueItem | null | undefined): PlayerTrack | null {
  if (!item) return null;

  switch (item.type) {
    case "audio_asset": {
      const a = item as AudioAsset;
      return {
        key: `audio_asset:${a.id}`,
        type: "audio_asset",
        id: a.id,
        assetId: a.id,
        title: a.title,
        titleBn: a.title_bn,
        subtitle: a.artists?.map((x) => x.name).join(", ") || a.programme || a.category || a.station || "Bangladesh Betar",
        artworkUrl: a.artwork_url,
        duration: a.duration_seconds,
        isPremium: a.is_premium,
        href: itemHref(a),
      };
    }
    case "song": {
      const s = item as Song;
      return {
        key: `song:${s.id}`,
        type: "song",
        id: s.id,
        assetId: s.audio_asset_id,
        title: s.title ?? "Untitled",
        titleBn: s.title_bn,
        subtitle: s.singers?.join(", ") || s.album?.title || s.genre || "Bangladesh Betar",
        artworkUrl: s.artwork_url,
        duration: s.duration_seconds,
        isPremium: s.is_premium,
        href: itemHref(s),
      };
    }
    case "podcast_episode": {
      const e = item as PodcastEpisode;
      if (!e.audio_asset_id) return null;
      return {
        key: `podcast_episode:${e.id}`,
        type: "podcast_episode",
        id: e.id,
        assetId: e.audio_asset_id,
        title: e.title,
        titleBn: e.title_bn,
        subtitle: e.channel?.title || e.hosts?.join(", ") || "Podcast",
        artworkUrl: e.artwork_url ?? e.channel?.artwork_url ?? null,
        duration: e.duration_seconds,
        isPremium: e.is_premium,
        href: itemHref(e),
      };
    }
    case "episode": {
      const e = item as Episode;
      if (!e.audio_asset_id) return null;
      return {
        key: `episode:${e.id}`,
        type: "episode",
        id: e.id,
        assetId: e.audio_asset_id,
        title: e.title,
        titleBn: e.title_bn,
        subtitle: e.programme || "Programme episode",
        artworkUrl: e.artwork_url,
        duration: e.duration_seconds,
        isPremium: false,
        href: itemHref(e),
      };
    }
    default:
      return null;
  }
}

/** A story plays its parent episode's asset from its start offset. */
export function storyTrack(story: Story, episode: Episode): PlayerTrack | null {
  if (!episode.audio_asset_id) return null;
  return {
    key: `story:${story.id}`,
    type: "story",
    id: story.id,
    assetId: episode.audio_asset_id,
    title: story.title,
    titleBn: story.title_bn,
    subtitle: story.storyteller ? `Told by ${story.storyteller}` : episode.title,
    artworkUrl: episode.artwork_url,
    duration:
      story.end_seconds != null && story.start_seconds != null
        ? story.end_seconds - story.start_seconds
        : episode.duration_seconds,
    isPremium: false,
    href: itemHref(episode),
    startAt: story.start_seconds ?? 0,
  };
}

/** Resolve a playlist's ordered items into tracks. */
export function playlistTracks(items: PlaylistItem[] | undefined): PlayerTrack[] {
  return (items ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((i) => toTrack(i.playable as CatalogueItem))
    .filter((t): t is PlayerTrack => t !== null);
}

/** Map a list of mixed items, dropping non-playables. */
export function toTracks(items: (CatalogueItem | null | undefined)[]): PlayerTrack[] {
  return items.map(toTrack).filter((t): t is PlayerTrack => t !== null);
}
