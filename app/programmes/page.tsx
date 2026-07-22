"use client";

import { useState } from "react";
import GridPage from "@/components/cards/GridPage";
import { useProgrammes } from "@/lib/hooks";

export default function ProgrammesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProgrammes(`?page=${page}&per_page=30`);

  return (
    <GridPage
      title="Programmes"
      subtitle="Radio programmes and their broadcast episodes — drama, news, magazine shows and more."
      data={data}
      isLoading={isLoading}
      page={page}
      onPage={setPage}
      emptyTitle="No programmes found"
    />
  );
}
