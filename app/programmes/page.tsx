"use client";

import { useState } from "react";
import GridPage from "@/components/cards/GridPage";
import { useProgrammes } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";

export default function ProgrammesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProgrammes(`?page=${page}&per_page=30`);

  return (
    <GridPage
      title={t("listenNav.programmes")}
      subtitle={t("listen.programmesSubtitle")}
      data={data}
      isLoading={isLoading}
      page={page}
      onPage={setPage}
      emptyTitle={t("listen.noProgrammes")}
    />
  );
}
