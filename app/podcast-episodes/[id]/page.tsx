"use client";

import { ChevronDown, ListOrdered } from "lucide-react";
import Link from "next/link";
import { use, useMemo, useState } from "react";
import DetailHero from "@/components/detail/DetailHero";
import Comments from "@/components/engagement/Comments";
import ArtistLinks from "@/components/ui/ArtistLinks";
import { PlayCircle, PremiumBadge, SectionHeading, Skeleton } from "@/components/ui/Misc";
import TrackMenu from "@/components/ui/TrackMenu";
import { displayTitle, altTitle, formatDate, formatDuration } from "@/lib/format";
import { useAsset, usePodcastEpisode } from "@/lib/hooks";
import { toTrack } from "@/lib/tracks";
import { useCurrentTrack, usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

export default function PodcastEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = usePodcastEpisode(id);
  const episode = data?.data;
  const { data: assetRes } = useAsset(episode?.audio_asset_id ?? null);
  const playTrack = usePlayer((s) => s.playTrack);
  const seek = usePlayer((s) => s.seek);
  const current = useCurrentTrack();
  const locale = useUi((s) => s.locale);
  const [chaptersOpen, setChaptersOpen] = useState(true);

  const track = useMemo(() => (episode ? toTrack(episode) : null), [episode]);

  if (isLoading || !episode) {
    return <Skeleton className="h-72 w-full rounded-panel" />;
  }

  const isCurrent = current?.key === track?.key;
  const seasonEp = [
    episode.season_number ? `S${episode.season_number}` : null,
    episode.episode_number ? `E${episode.episode_number}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-8">
      <DetailHero
        type="podcast_episode"
        id={episode.id}
        artworkUrl={episode.artwork_url ?? episode.channel?.artwork_url}
        kicker={`Podcast episode${seasonEp ? ` · ${seasonEp}` : ""}`}
        title={displayTitle(episode, locale)}
        titleAlt={altTitle(episode, locale)}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {episode.is_premium && <PremiumBadge />}
            {episode.channel && (
              <Link href={`/podcasts/${episode.channel.id}`} className="font-semibold text-ink hover:underline">
                {episode.channel.title}
              </Link>
            )}
            {(episode.artists?.some((a) => a.role === "host") || (episode.hosts?.length ?? 0) > 0) && (
              <span>
                · Hosted by{" "}
                <ArtistLinks artists={episode.artists?.filter((a) => a.role === "host")} fallback={episode.hosts?.join(", ")} />
              </span>
            )}
          </span>
        }
        meta={
          <>
            {episode.published_at && <span>{formatDate(episode.published_at)}</span>}
            <span>· {formatDuration(episode.duration_seconds)}</span>
            <span>· {episode.play_count} plays</span>
          </>
        }
        actions={
          <>
            {track && <PlayCircle size="size-14" icon="size-6" onClick={() => playTrack(track)} />}
            {track && <TrackMenu track={track} />}
          </>
        }
      />

      {episode.description && (
        <p className="max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{episode.description}</p>
      )}

      {episode.chapters && episode.chapters.length > 0 && (
        <section>
          <SectionHeading
            title={<span className="flex items-center gap-2"><ListOrdered className="size-5 text-accent" /> Chapters</span>}
            action={
              <button
                type="button"
                onClick={() => setChaptersOpen((o) => !o)}
                aria-expanded={chaptersOpen}
                aria-label={chaptersOpen ? "Collapse chapters" : "Expand chapters"}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-mute transition hover:bg-raised hover:text-ink"
              >
                {chaptersOpen ? "Hide" : "Show"}
                <ChevronDown className={`size-4 transition-transform ${chaptersOpen ? "" : "-rotate-90"}`} />
              </button>
            }
          />
          {chaptersOpen && (
          <div className="flex flex-col">
            {episode.chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => {
                  if (isCurrent) seek(ch.start_seconds);
                  else if (track) playTrack({ ...track, startAt: ch.start_seconds });
                }}
                className="flex items-center gap-4 rounded-card px-3 py-2.5 text-left transition hover:bg-raised"
              >
                <span className="w-12 text-xs tabular-nums text-accent">{formatDuration(ch.start_seconds)}</span>
                <span className="text-sm font-medium">{ch.title}</span>
              </button>
            ))}
          </div>
          )}
        </section>
      )}

      {episode.audio_asset_id && (
        <Comments
          assetId={episode.audio_asset_id}
          allowComments={assetRes?.data.allow_comments}
          avgRating={assetRes?.data.avg_rating}
          ratingCount={assetRes?.data.rating_count}
          myRating={assetRes?.data.my_rating}
        />
      )}
    </div>
  );
}
