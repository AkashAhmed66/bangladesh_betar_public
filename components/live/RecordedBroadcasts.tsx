"use client";

import { Crown, RadioTower, ShieldCheck } from "lucide-react";
import { useState } from "react";
import RecordedBroadcastTable from "@/components/live/RecordedBroadcastTable";
import Pagination from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Misc";
import { useBroadcastRecordings } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";

export default function RecordedBroadcasts() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBroadcastRecordings(page);
  const recordings = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;

  return (
    <section id="previous-broadcasts" className="mt-4 border-t border-edge pt-8" aria-labelledby="recorded-broadcasts-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="recorded-broadcasts-title" className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              {t("catalogue.previousBroadcasts")}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-premium/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-premium">
              <Crown className="size-3" /> {t("catalogue.premium")}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            {t("catalogue.recordingHelp")}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-mute">
          <ShieldCheck className="size-4 text-accent" /> {t("catalogue.protectedStreaming")}
        </span>
      </div>

      <div className="mt-5">
        {isLoading && !data ? (
          <Skeleton className="h-72 rounded-panel" />
        ) : recordings.length === 0 ? (
          <div className="rounded-panel bg-raised px-6 py-10 text-center">
            <RadioTower className="mx-auto size-9 text-ink-mute" />
            <p className="mt-3 text-sm font-semibold">{t("catalogue.noBroadcasts")}</p>
            <p className="mt-1 text-xs text-ink-mute">{t("catalogue.noBroadcastsDescription")}</p>
          </div>
        ) : (
          <RecordedBroadcastTable recordings={recordings} />
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} className="mt-6" />
    </section>
  );
}
