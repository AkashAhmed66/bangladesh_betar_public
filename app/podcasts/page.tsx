"use client";

import { useState } from "react";
import GridPage from "@/components/cards/GridPage";
import { usePodcasts } from "@/lib/hooks";

export default function PodcastsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePodcasts(`?page=${page}&per_page=30`);

  return (
    <GridPage
      title="Podcasts"
      subtitle="Original shows from Bangladesh Betar — including the beloved Bhoot FM archive."
      data={data}
      isLoading={isLoading}
      page={page}
      onPage={setPage}
      emptyTitle="No podcasts yet"
    />
  );
}
