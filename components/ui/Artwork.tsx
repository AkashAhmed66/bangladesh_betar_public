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
      className={`${className} ${rounded} relative flex items-center justify-center overflow-hidden`}
      style={artworkCss(art)}
    >
      <Icon className={`${iconClassName} text-white/25`} />
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_120%,rgba(0,0,0,0.45),transparent)]" />
    </div>
  );
}
