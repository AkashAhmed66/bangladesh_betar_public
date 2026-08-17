"use client";

import {
  BookOpen,
  Disc3,
  ListMusic,
  MicVocal,
  Music2,
  Podcast,
  Radio,
  RadioTower,
} from "lucide-react";
import { artworkCss, artworkFor } from "@/lib/artwork";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  song: Music2,
  audio_asset: Radio,
  album: Disc3,
  artist: MicVocal,
  programme: RadioTower,
  episode: RadioTower,
  story: BookOpen,
  podcast_channel: Podcast,
  podcast_episode: Podcast,
  playlist: ListMusic,
  live_channel: RadioTower,
  audio_book: BookOpen,
};

interface ArtworkProps {
  type: string;
  id: number;
  url?: string | null;
  title?: string;
  className?: string;
  iconClassName?: string;
  rounded?: string;
}

/**
 * Cover art with a generative fallback: items without uploaded artwork get
 * a stable, rich gradient derived from their identity.
 */
export default function Artwork({
  type,
  id,
  url,
  title = "",
  className = "",
  iconClassName = "size-1/3",
  rounded = "rounded-card",
}: ArtworkProps) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={title}
        loading="lazy"
        className={`${className} ${rounded} object-cover bg-raised`}
      />
    );
  }

  const art = artworkFor(type, id);
  const Icon = TYPE_ICONS[type] ?? Radio;

  return (
    <div
      aria-hidden
      className={`${className} ${rounded} artwork-themed artwork-surface relative flex items-center justify-center overflow-hidden`}
      style={artworkCss(art)}
    >
      <Icon className={`${iconClassName} text-artwork-ink/30`} />
      <div className="artwork-vignette absolute inset-0" />
    </div>
  );
}
