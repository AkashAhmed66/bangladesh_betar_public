"use client";

import { use, useMemo } from "react";
import DetailHero from "@/components/detail/DetailHero";
import { PlayCircle, Skeleton } from "@/components/ui/Misc";
import { displayTitle, altTitle, formatDate, formatDuration } from "@/lib/format";
import { useEpisode } from "@/lib/hooks";
import { toTrack } from "@/lib/tracks";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

/** Programme episode detail page. */
export default function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useEpisode(id);
  const episode = data?.data;
  const playTrack = usePlayer((s) => s.playTrack);
  const locale = useUi((s) => s.locale);

  const track = useMemo(() => (episode ? toTrack(episode) : null), [episode]);

  if (isLoading || !episode) {
    return <Skeleton className="h-72 w-full rounded-panel" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <DetailHero
        type="episode"
        id={episode.id}
        artworkUrl={episode.artwork_url}
        kicker={episode.programme ? `${episode.programme} · Episode ${episode.number ?? ""}` : "Episode"}
        title={displayTitle(episode, locale)}
        titleAlt={altTitle(episode, locale)}
        meta={
          <>
            {episode.broadcast_date && <span>Broadcast {formatDate(episode.broadcast_date)}</span>}
            <span>· {formatDuration(episode.duration_seconds)}</span>
            <span>· {episode.play_count} plays</span>
          </>
        }
        actions={track && <PlayCircle size="size-14" icon="size-6" onClick={() => playTrack(track)} />}
      />

      {episode.description && (
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">{episode.description}</p>
      )}
    </div>
  );
}
