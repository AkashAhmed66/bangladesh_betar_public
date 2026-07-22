"use client";

import { use, useMemo } from "react";
import TrackTable from "@/components/cards/TrackTable";
import DetailHero from "@/components/detail/DetailHero";
import FollowButton from "@/components/ui/FollowButton";
import { PlayCircle, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { displayTitle, altTitle, formatCount } from "@/lib/format";
import { useProgramme } from "@/lib/hooks";
import { toTracks } from "@/lib/tracks";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

export default function ProgrammePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useProgramme(id);
  const programme = data?.data;
  const episodes = useMemo(() => data?.episodes.data ?? [], [data]);
  const playContext = usePlayer((s) => s.playContext);
  const locale = useUi((s) => s.locale);

  const tracks = useMemo(() => toTracks(episodes), [episodes]);

  if (isLoading || !programme) {
    return <Skeleton className="h-72 w-full rounded-panel" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <DetailHero
        type="programme"
        id={programme.id}
        artworkUrl={programme.artwork_url}
        kicker={programme.programme_type ? `Programme · ${programme.programme_type}` : "Programme"}
        title={displayTitle(programme, locale)}
        titleAlt={altTitle(programme, locale)}
        meta={
          <>
            {programme.station && <span>{programme.station}</span>}
            {programme.category && <span>· {programme.category}</span>}
            <span>· {programme.episodes_count ?? episodes.length} episodes</span>
            <span>· {formatCount(programme.followers_count)} followers</span>
          </>
        }
        actions={
          <>
            {tracks.length > 0 && (
              <PlayCircle size="size-14" icon="size-6" onClick={() => playContext(tracks, 0, programme.title)} label={`Play ${programme.title}`} />
            )}
            <FollowButton type="programme" id={programme.id} initial={programme.is_following} />
          </>
        }
      />

      {programme.description && (
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">{programme.description}</p>
      )}

      <section>
        <SectionHeading title="Episodes" />
        <TrackTable tracks={tracks} contextLabel={programme.title} showPlays playCounts={episodes.map((e) => e.play_count)} />
      </section>
    </div>
  );
}
