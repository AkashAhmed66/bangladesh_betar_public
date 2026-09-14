"use client";

import { ChevronDown, RadioTower, RotateCcw, Search, SearchX } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { ChannelStation } from "@/lib/useLiveChannelFilters";

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  stationId: string;
  onStationChange: (id: string) => void;
  stations: ChannelStation[];
  resultCount: number;
  totalCount: number;
  onReset: () => void;
  loading?: boolean;
};

export default function LiveChannelFilters({
  query, onQueryChange, stationId, onStationChange, stations,
  resultCount, totalCount, onReset, loading = false,
}: Props) {
  const { locale, t } = useTranslation();
  const active = Boolean(query || stationId);

  return (
    <form
      role="search"
      aria-label={t("liveFilters.label")}
      onSubmit={(event) => event.preventDefault()}
      className="live-channel-filters rounded-panel border p-4 sm:p-5"
    >
      <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]">
        <label className="block min-w-0">
          <span className="live-channel-filter-muted mb-2 block text-xs font-bold">{t("liveFilters.search")}</span>
          <span className="live-channel-filter-control flex min-h-12 items-center gap-3 rounded-xl border px-4 transition">
            <Search className="live-channel-filter-accent size-4.5 shrink-0" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={t("liveFilters.searchPlaceholder")}
              className="min-w-0 flex-1 bg-transparent py-3 text-sm font-medium outline-none"
            />
          </span>
        </label>
        <label className="block min-w-0">
          <span className="live-channel-filter-muted mb-2 block text-xs font-bold">{t("liveFilters.station")}</span>
          <span className="live-channel-filter-control relative flex min-h-12 items-center rounded-xl border transition">
            <RadioTower className="live-channel-filter-accent pointer-events-none absolute left-4 size-4.5" aria-hidden="true" />
            <select
              value={stationId}
              onChange={(event) => onStationChange(event.target.value)}
              className="min-h-12 w-full min-w-0 appearance-none rounded-xl bg-transparent pl-11 pr-10 text-sm font-semibold outline-none"
            >
              <option value="">{t("liveFilters.allStations")}</option>
              {stationId && !stations.some((station) => station.id === stationId) && (
                <option value={stationId}>{t("liveFilters.unavailableStation")}</option>
              )}
              {stations.map((station) => <option key={station.id} value={station.id}>{station.label}</option>)}
            </select>
            <ChevronDown className="live-channel-filter-muted pointer-events-none absolute right-4 size-4" aria-hidden="true" />
          </span>
        </label>
        <button
          type="button"
          disabled={!active}
          onClick={onReset}
          className="live-channel-filter-reset inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition disabled:cursor-default disabled:opacity-45"
        >
          <RotateCcw className="size-4" aria-hidden="true" /> {t("liveFilters.reset")}
        </button>
      </div>
      <p role="status" className="live-channel-filter-muted mt-4 text-xs font-medium">
        {loading ? t("liveFilters.loading") : t("liveFilters.resultCount", {
          count: resultCount.toLocaleString(locale), total: totalCount.toLocaleString(locale),
        })}
      </p>
    </form>
  );
}

export function LiveChannelNoResults({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="live-channel-filters flex flex-col items-center gap-3 rounded-panel border border-dashed px-5 py-12 text-center">
      <SearchX className="live-channel-filter-accent size-8" aria-hidden="true" />
      <h3 className="font-display text-xl font-bold">{t("liveFilters.noResults")}</h3>
      <p className="live-channel-filter-muted max-w-sm text-sm leading-relaxed">{t("liveFilters.noResultsDescription")}</p>
      <button type="button" onClick={onReset} className="live-channel-filter-reset mt-2 rounded-full border px-5 py-3 text-sm font-bold transition">
        {t("liveFilters.reset")}
      </button>
    </div>
  );
}
