"use client";

import Link from "next/link";
import Artwork from "@/components/ui/Artwork";
import { PlayCircle, PremiumBadge } from "@/components/ui/Misc";
import { displayTitle, formatCount, itemHref, typeLabel } from "@/lib/format";
import { playItem } from "@/lib/play";
import type { Album, Artist, AudioAsset, CatalogueItem, Playlist, PodcastChannel, Programme, Song } from "@/lib/types";
import { useUi } from "@/stores/ui";

function subtitleFor(item: CatalogueItem): string {
  switch (item.type) {
    case "song": {
      const s = item as Song;
      return s.singers?.join(", ") || s.genre || "Song";
    }
    case "album": {
      const a = item as Album;
      const artists = a.artists?.map((x) => x.name).join(", ");
      return [a.year, artists].filter(Boolean).join(" · ") || "Album";
    }
    case "artist": {
      const a = item as Artist;
      return `${a.artist_type ? a.artist_type[0].toUpperCase() + a.artist_type.slice(1) : "Artist"} · ${formatCount(a.followers_count)} followers`;
    }
    case "programme": {
      const p = item as Programme;
      return [p.programme_type, p.station].filter(Boolean).join(" · ") || "Programme";
    }
    case "podcast_channel": {
      const p = item as PodcastChannel;
      return p.category || "Podcast";
    }
    case "playlist": {
      const p = item as Playlist;
      return p.description || `Playlist${p.items_count != null ? ` · ${p.items_count} items` : ""}`;
    }
    case "audio_asset": {
      const a = item as AudioAsset;
      return a.artists?.map((x) => x.name).join(", ") || a.category || a.station || "Archive recording";
    }
    default:
      return typeLabel(item.type);
  }
}

function isPremium(item: CatalogueItem): boolean {
  return "is_premium" in item && Boolean(item.is_premium);
}

export default function MediaCard({ item }: { item: CatalogueItem }) {
  const locale = useUi((s) => s.locale);
  const round = item.type === "artist";
  const artworkUrl =
    ("artwork_url" in item ? item.artwork_url : null) ??
    ("photo_url" in item ? (item as Artist).photo_url : null);

  return (
    <Link
      href={itemHref(item)}
      className="group relative flex w-40 shrink-0 flex-col gap-3 rounded-panel bg-transparent p-3 transition-colors duration-200 hover:bg-raised sm:w-44"
    >
      <div className="relative">
        <Artwork
          type={item.type}
          id={item.id}
          url={artworkUrl}
          title={displayTitle(item, locale)}
          className={`aspect-square w-full shadow-lg shadow-black/40 ${round ? "" : ""}`}
          rounded={round ? "rounded-full" : "rounded-card"}
        />
        {isPremium(item) && <PremiumBadge className="absolute left-1.5 top-1.5" />}
        <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <PlayCircle onClick={() => void playItem(item)} label={`Play ${displayTitle(item, locale)}`} />
        </div>
      </div>
      <div className="min-w-0">
        <p className={`clamp-1 text-sm font-semibold ${round ? "text-center" : ""}`}>
          {displayTitle(item, locale)}
        </p>
        <p className={`clamp-2 mt-0.5 text-xs text-ink-mute ${round ? "text-center" : ""}`}>
          {subtitleFor(item)}
        </p>
      </div>
    </Link>
  );
}
