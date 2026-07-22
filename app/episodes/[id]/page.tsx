"use client";

import { MapPin, Play } from "lucide-react";
import { use, useMemo } from "react";
import DetailHero from "@/components/detail/DetailHero";
import { PlayCircle, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { displayTitle, altTitle, formatDate, formatDuration } from "@/lib/format";
import { useEpisode } from "@/lib/hooks";
import { storyTrack, toTrack } from "@/lib/tracks";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

/** Episode page with its stories (e.g. Bhoot FM segments), seek-to-story. */
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

  const stories = episode.stories ?? [];

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

      {stories.length > 0 && (
        <section>
          <SectionHeading title="Stories in this episode" />
          <div className="flex flex-col gap-3">
            {stories.map((story) => {
              const st = storyTrack(story, episode);
              return (
                <div
                  key={story.id}
                  className="group flex items-start gap-4 rounded-panel border border-edge bg-raised/50 p-4 transition hover:bg-raised"
                >
                  <button
                    aria-label={`Play ${story.title}`}
                    disabled={!st}
                    onClick={() => st && playTrack(st)}
                    className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent transition group-hover:bg-accent group-hover:text-accent-fg disabled:opacity-40"
                  >
                    <Play className="size-4 translate-x-[1px] fill-current" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{displayTitle(story, locale)}</p>
                    {story.summary && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{story.summary}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-mute">
                      {story.storyteller && <span>Told by {story.storyteller}</span>}
                      {story.narrator && <span>· Narrated by {story.narrator}</span>}
                      {story.district && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" /> {story.district}
                        </span>
                      )}
                      {story.start_seconds != null && (
                        <span>· starts at {formatDuration(story.start_seconds)}</span>
                      )}
                    </div>
                    {story.content_warning && (
                      <p className="mt-2 text-xs text-premium">Advisory: {story.content_warning}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
