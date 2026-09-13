"use client";

import { useState } from "react";
import GridPage from "@/components/cards/GridPage";
import { useArtists } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";

const TYPES = [
  { value: "", labelKey: "listen.all" },
  { value: "singer", labelKey: "listen.singers" },
  { value: "composer", labelKey: "listen.composers" },
  { value: "lyricist", labelKey: "listen.lyricists" },
  { value: "instrumentalist", labelKey: "listen.instrumentalists" },
  { value: "narrator", labelKey: "listen.narrators" },
];

export default function ArtistsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const { data, isLoading } = useArtists(`?page=${page}&per_page=30${type ? `&type=${type}` : ""}`);

  return (
    <GridPage
      title={t("listenNav.artists")}
      subtitle={t("listen.artistsSubtitle")}
      data={data}
      isLoading={isLoading}
      page={page}
      onPage={setPage}
      emptyTitle={t("listen.noArtists")}
      filters={
        <div className="flex flex-wrap gap-2">
          {TYPES.map((artistType) => (
            <button
              key={artistType.value}
              onClick={() => { setType(artistType.value); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                type === artistType.value ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
              }`}
            >
              {t(artistType.labelKey)}
            </button>
          ))}
        </div>
      }
    />
  );
}
