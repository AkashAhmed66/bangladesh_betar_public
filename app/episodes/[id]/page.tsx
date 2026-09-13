"use client";

import { use, useMemo } from "react";
import Chapters from "@/components/detail/Chapters";
import DetailHero from "@/components/detail/DetailHero";
import ContentActions from "@/components/engagement/ContentActions";
import { PlayCircle, Skeleton } from "@/components/ui/Misc";
import { displayTitle, altTitle, formatDate, formatDuration } from "@/lib/format";
import { useEpisode } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import { toTrack } from "@/lib/tracks";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

/** Programme episode detail page. */
export default function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const { id } = use(params);
  const { data, isLoading } = useEpisode(id);
  const episode = data?.data;
  const playTrack = usePlayer((s) => s.playTrack);
  const locale = useUi((s) => s.locale);

  const track = useMemo(() => (episode ? toTrack(episode) : null), [episode]);

  if (isLoading || !episode) {
    return <Skeleton className="h-72 w-full rounded-panel" />;
  }
  const description = localizedText(episode as unknown as Record<string, unknown>, "description", locale);

  return (
    <div className="flex flex-col gap-8">
      <DetailHero
        type="episode"
        id={episode.id}
        artworkUrl={episode.artwork_url}
        kicker={episode.programme ? `${episode.programme} · ${t("detail.episodeNumber", { number: episode.number ?? "" })}` : t("detail.episode")}
        title={displayTitle(episode, locale)}
        titleAlt={altTitle(episode, locale)}
        meta={
          <>
            {episode.broadcast_date && <span>{t("detail.broadcast", { date: formatDate(episode.broadcast_date, locale) })}</span>}
            <span>· {formatDuration(episode.duration_seconds)}</span>
            <span>· {t("detail.plays", { count: episode.play_count })}</span>
          </>
        }
        actions={
          <>
            {track && <PlayCircle size="size-14" icon="size-6" onClick={() => playTrack(track)} />}
            <ContentActions type="episode" id={episode.id} title={displayTitle(episode, locale)} text={description || undefined} />
          </>
        }
      />

      <Chapters assetId={episode.audio_asset_id} track={track} />

      {description && (
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">{description}</p>
      )}
    </div>
  );
}
