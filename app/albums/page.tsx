"use client";

import { useState } from "react";
import GridPage from "@/components/cards/GridPage";
import { useAlbums } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";

export default function AlbumsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const { data, isLoading } = useAlbums(`?page=${page}&per_page=30${q ? `&q=${encodeURIComponent(q)}` : ""}`);

  return (
    <GridPage
      title={t("listenNav.albums")}
      subtitle={t("listen.albumsSubtitle")}
      data={data}
      isLoading={isLoading}
      page={page}
      onPage={setPage}
      emptyTitle={t("listen.noAlbums")}
      filters={
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder={t("listen.filterAlbums")}
          className="max-w-xs rounded-full border border-edge bg-raised px-5 py-2 text-sm outline-none transition placeholder:text-ink-mute focus:border-accent"
        />
      }
    />
  );
}
