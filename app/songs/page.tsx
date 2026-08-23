"use client";

import { Disc3, Music2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import TrackTable from "@/components/cards/TrackTable";
import ListenPageHero from "@/components/cards/ListenPageHero";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useGenres, useSongs } from "@/lib/hooks";
import { toTracks } from "@/lib/tracks";
import { localizedText, useTranslation } from "@/lib/i18n";

function SongsContent() {
  const { locale, t } = useTranslation();
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
    <div className="flex flex-col gap-8 sm:gap-10">
      <ListenPageHero
        title={t("listen.songsHero")}
        description={t("listen.songsDescription")}
        icon={<Disc3 className="size-3.5" />}
        meta={data?.meta?.total != null ? t("listen.songsCount", { count: data.meta.total.toLocaleString() }) : t("listen.curatedBy")}
      />

      <div className="flex flex-wrap items-center gap-2 rounded-panel border border-edge bg-raised/70 p-3 shadow-sm sm:p-4">
        <button
          onClick={() => { setGenre(""); setPage(1); }}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            !genre ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
          }`}
        >
          {t("listen.allGenres")}
        </button>
        {(genres?.data ?? []).map((g) => (
          <button
            key={g.id}
            onClick={() => { setGenre(String(g.id)); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              genre === String(g.id) ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
            }`}
          >
            {localizedText(g as unknown as Record<string, unknown>, "name", locale)}
          </button>
        ))}
        <div className="flex-1" />
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value as "latest" | "popular"); setPage(1); }}
          aria-label={t("listen.sortSongs")}
          className="rounded-full border border-edge bg-raised px-4 py-1.5 text-sm font-semibold text-ink-soft outline-none"
        >
          <option value="popular">{t("listen.mostPlayed")}</option>
          <option value="latest">{t("listen.recentlyAdded")}</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      )}

      {!isLoading && !tracks.length && (
        <EmptyState icon={<Music2 className="size-10" />} title={t("listen.noSongs")} subtitle={t("listen.differentGenre")} />
      )}

      <section className="overflow-hidden rounded-panel border border-edge bg-elev p-2 shadow-sm sm:p-4">
        <div className="mb-3 flex items-center justify-between border-b border-edge px-3 pb-4 pt-2">
          <div>
            <p className="font-display text-xl font-bold">{t("listen.catalogueTitle")}</p>
            <p className="mt-1 text-xs text-ink-mute">{t("listen.catalogueHelp")}</p>
          </div>
          <Music2 className="size-5 text-[var(--portal-color)]" />
        </div>
        <TrackTable
          tracks={tracks}
          contextLabel={t("listenNav.songs")}
          showPlays
          playCounts={songs.map((s) => s.play_count)}
          favorited={songs.map((s) => s.is_favorited)}
          startIndexAt={(page - 1) * 30}
        />
      </section>

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full bg-raised px-5 py-2 text-sm font-semibold transition enabled:hover:bg-highlight disabled:opacity-30"
          >
            {t("common.previous")}
          </button>
          <span className="text-sm tabular-nums text-ink-mute">{t("common.pageOf", { page, pages: lastPage })}</span>
          <button
            disabled={page >= lastPage}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full bg-raised px-5 py-2 text-sm font-semibold transition enabled:hover:bg-highlight disabled:opacity-30"
          >
            {t("common.next")}
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
