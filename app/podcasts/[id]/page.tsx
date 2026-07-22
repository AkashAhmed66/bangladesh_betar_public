"use client";

import { Rss } from "lucide-react";
import { use, useMemo } from "react";
import TrackTable from "@/components/cards/TrackTable";
import DetailHero from "@/components/detail/DetailHero";
import FollowButton from "@/components/ui/FollowButton";
import { PlayCircle, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { displayTitle, altTitle, formatCount } from "@/lib/format";
import { usePodcast } from "@/lib/hooks";
import { toTracks } from "@/lib/tracks";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

export default function PodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = usePodcast(id);
  const channel = data?.data;
  const episodes = useMemo(() => data?.episodes.data ?? [], [data]);
  const playContext = usePlayer((s) => s.playContext);
  const locale = useUi((s) => s.locale);

  const tracks = useMemo(() => toTracks(episodes), [episodes]);

  if (isLoading || !channel) {
    return <Skeleton className="h-72 w-full rounded-panel" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <DetailHero
        type="podcast_channel"
        id={channel.id}
        artworkUrl={channel.artwork_url}
        kicker="Podcast"
        title={displayTitle(channel, locale)}
        titleAlt={altTitle(channel, locale)}
        meta={
          <>
            {channel.category && <span>{channel.category}</span>}
            <span>· {channel.episodes_count ?? episodes.length} episodes</span>
            <span>· {formatCount(channel.followers_count)} followers</span>
          </>
        }
        actions={
          <>
            {tracks.length > 0 && (
              <PlayCircle size="size-14" icon="size-6" onClick={() => playContext(tracks, 0, channel.title)} label={`Play ${channel.title}`} />
            )}
            <FollowButton type="podcast_channel" id={channel.id} initial={channel.is_following} />
            {channel.rss_url && (
              <a
                href={channel.rss_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-edge-strong px-4 py-1.5 text-sm font-semibold text-ink-soft transition hover:border-ink hover:text-ink"
              >
                <Rss className="size-4" /> RSS
              </a>
            )}
          </>
        }
      />

      {channel.description && (
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">{channel.description}</p>
      )}

      <section>
        <SectionHeading title="Episodes" />
        <TrackTable tracks={tracks} contextLabel={channel.title} showPlays playCounts={episodes.map((e) => e.play_count)} />
      </section>
    </div>
  );
}
