"use client";

import { useState } from "react";
import GridPage from "@/components/cards/GridPage";
import { useArtists } from "@/lib/hooks";

const TYPES = [
  { value: "", label: "All" },
  { value: "singer", label: "Singers" },
  { value: "composer", label: "Composers" },
  { value: "lyricist", label: "Lyricists" },
  { value: "instrumentalist", label: "Instrumentalists" },
  { value: "narrator", label: "Narrators" },
];

export default function ArtistsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const { data, isLoading } = useArtists(`?page=${page}&per_page=30${type ? `&type=${type}` : ""}`);

  return (
    <GridPage
      title="Artists"
      subtitle="The voices and composers behind the archive."
      data={data}
      isLoading={isLoading}
      page={page}
      onPage={setPage}
      emptyTitle="No artists found"
      filters={
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => { setType(t.value); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                type === t.value ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    />
  );
}
