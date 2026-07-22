"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import TrackTable from "@/components/cards/TrackTable";
import DetailHero from "@/components/detail/DetailHero";
import { EmptyState, PlayCircle, Skeleton } from "@/components/ui/Misc";
import { useFavorites } from "@/lib/hooks";
import { toTracks } from "@/lib/tracks";
import { useAuth } from "@/stores/auth";
import { usePlayer } from "@/stores/player";

export default function FavoritesPage() {
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);
  const { data, isLoading } = useFavorites();
  const playContext = usePlayer((s) => s.playContext);

  const assets = useMemo(() => data?.data ?? [], [data]);
  const tracks = useMemo(() => toTracks(assets), [assets]);

  if (hydrated && !token) {
    return (
      <EmptyState
        icon={<Heart className="size-10" />}
        title="Your liked recordings"
        subtitle="Sign in to see everything you have favourited."
        action={
          <Link href="/login" className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover">
            Sign in
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DetailHero
        type="playlist"
        id={9999}
        kicker="Collection"
        title="Liked recordings"
        meta={<span>{data?.meta.total ?? 0} favourites</span>}
        actions={
          tracks.length > 0 && (
            <PlayCircle size="size-14" icon="size-6" onClick={() => playContext(tracks, 0, "Liked recordings")} label="Play liked recordings" />
          )
        }
      />

      {isLoading && <Skeleton className="h-40 w-full" />}

      {!isLoading && tracks.length === 0 && (
        <EmptyState
          icon={<Heart className="size-10" />}
          title="Nothing liked yet"
          subtitle="Tap the heart on any recording to build your collection."
        />
      )}

      <TrackTable
        tracks={tracks}
        contextLabel="Liked recordings"
        showPlays
        playCounts={assets.map((a) => a.play_count)}
        favorited={assets.map(() => true)}
      />
    </div>
  );
}
