"use client";

import { useState } from "react";
import GridPage from "@/components/cards/GridPage";
import { usePodcasts } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";

export default function PodcastsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePodcasts(`?page=${page}&per_page=30`);

  return (
    <GridPage
      title={t("listenNav.podcasts")}
      subtitle={t("listen.podcastsSubtitle")}
      data={data}
      isLoading={isLoading}
      page={page}
      onPage={setPage}
      emptyTitle={t("listen.noPodcasts")}
    />
  );
}
