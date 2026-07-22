"use client";

import { useState } from "react";
import GridPage from "@/components/cards/GridPage";
import { useAlbums } from "@/lib/hooks";

export default function AlbumsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const { data, isLoading } = useAlbums(`?page=${page}&per_page=30${q ? `&q=${encodeURIComponent(q)}` : ""}`);

  return (
    <GridPage
      title="Albums"
      subtitle="Studio albums, compilations and archival collections."
      data={data}
      isLoading={isLoading}
      page={page}
      onPage={setPage}
      emptyTitle="No albums found"
      filters={
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Filter albums by title…"
          className="max-w-xs rounded-full border border-edge bg-raised px-5 py-2 text-sm outline-none transition placeholder:text-ink-mute focus:border-accent"
        />
      }
    />
  );
}
