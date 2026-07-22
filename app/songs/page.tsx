"use client";

import { Music2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import TrackTable from "@/components/cards/TrackTable";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useGenres, useSongs } from "@/lib/hooks";
import { toTracks } from "@/lib/tracks";

function SongsContent() {
  const params = useSearchParams();
  const [genre, setGenre] = useState(params.get("genre") ?? "");
  const [sort, setSort] = useState<"latest" | "popular">("popular");
  const [page, setPage] = useState(1);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (genre) p.set("genre", genre);
    if (sort === "popular") p.set("sort", "popular");
    p.set("page", String(page));
    p.set("per_page", "30");
    return `?${p.toString()}`;
  }, [genre, sort, page]);

  const { data, isLoading } = useSongs(qs);
  const { data: genres } = useGenres();
  const songs = useMemo(() => data?.data ?? [], [data]);
  const tracks = useMemo(() => toTracks(songs), [songs]);
  const lastPage = data?.meta?.last_page ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Songs</h1>
        <p className="mt-1 text-sm text-ink-soft">Every published song in the national music archive.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => { setGenre(""); setPage(1); }}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            !genre ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
          }`}
        >
          All genres
        </button>
        {(genres?.data ?? []).map((g) => (
          <button
            key={g.id}
            onClick={() => { setGenre(String(g.id)); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              genre === String(g.id) ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
            }`}
          >
            {g.name}
          </button>
        ))}
        <div className="flex-1" />
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value as "latest" | "popular"); setPage(1); }}
          aria-label="Sort songs"
          className="rounded-full border border-edge bg-raised px-4 py-1.5 text-sm font-semibold text-ink-soft outline-none"
        >
          <option value="popular">Most played</option>
          <option value="latest">Recently added</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      )}

      {!isLoading && !tracks.length && (
        <EmptyState icon={<Music2 className="size-10" />} title="No songs found" subtitle="Try a different genre." />
      )}

      <TrackTable
        tracks={tracks}
        contextLabel="Songs"
        showPlays
        playCounts={songs.map((s) => s.play_count)}
        favorited={songs.map((s) => s.is_favorited)}
        startIndexAt={(page - 1) * 30}
      />

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full bg-raised px-5 py-2 text-sm font-semibold transition enabled:hover:bg-highlight disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm tabular-nums text-ink-mute">Page {page} of {lastPage}</span>
          <button
            disabled={page >= lastPage}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full bg-raised px-5 py-2 text-sm font-semibold transition enabled:hover:bg-highlight disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function SongsPage() {
  return (
    <Suspense>
      <SongsContent />
    </Suspense>
  );
}
