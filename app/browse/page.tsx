"use client";

import { CalendarDays, Compass } from "lucide-react";
import ListenPageHero from "@/components/cards/ListenPageHero";
import SectionRow from "@/components/cards/SectionRow";
import {
  useNewReleases,
  useOnThisDay,
  useTrending,
} from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

export default function BrowsePage() {
  const { locale, t } = useTranslation();
  const { data: trending, isLoading: l1 } = useTrending();
  const { data: newReleases, isLoading: l2 } = useNewReleases();
  const { data: onThisDay } = useOnThisDay();

  return (
    <div className="flex flex-col gap-10 sm:gap-14">
      <ListenPageHero
        eyebrow={t("listen.exploreArchive")}
        title={t("listen.browseHero")}
        description={t("listen.browseDescription")}
        icon={<Compass className="size-3.5" />}
      />

      <SectionRow title={t("listen.trendingNow")} items={trending?.data} loading={l1} />
      <SectionRow title={t("listen.newReleases")} items={newReleases?.data} loading={l2} />

      {onThisDay && onThisDay.data.length > 0 && (
        <SectionRow
          title={
            <span className="flex items-center gap-2">
              <CalendarDays className="size-5 text-accent" />
              {t("listen.onThisDay", { date: formatDate(onThisDay.date, locale) })}
            </span>
          }
          items={onThisDay.data}
        />
      )}
    </div>
  );
}
