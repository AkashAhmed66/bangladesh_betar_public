"use client";

import MediaCard from "./MediaCard";
import ListenPageHero from "./ListenPageHero";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import type { CatalogueItem, Paginated } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface GridPageProps<T extends CatalogueItem> {
  title: string;
  subtitle?: string;
  data?: Paginated<T>;
  isLoading: boolean;
  page: number;
  onPage: (p: number) => void;
  emptyTitle?: string;
  filters?: React.ReactNode;
}

/** Shared paginated card-grid layout for catalogue index pages. */
export default function GridPage<T extends CatalogueItem>({
  title, subtitle, data, isLoading, page, onPage, emptyTitle, filters,
}: GridPageProps<T>) {
  const { t } = useTranslation();
  const items = data?.data ?? [];
  const lastPage = data?.meta?.last_page ?? 1;

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <ListenPageHero
        title={title}
        description={subtitle}
        meta={data?.meta?.total != null ? t("catalogue.available", { count: data.meta.total.toLocaleString() }) : undefined}
      />

      {filters && (
        <div className="-mt-2 rounded-panel border border-edge bg-raised/70 p-3 shadow-sm backdrop-blur sm:p-4">
          {filters}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 min-[520px]:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="min-w-0">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title={emptyTitle ?? t("catalogue.nothingHere")} />
      ) : (
        <div className="grid grid-cols-2 gap-4 min-[520px]:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 sm:gap-5">
          {items.map((item) => (
            <MediaCard key={`${item.type}:${item.id}`} item={item} />
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <button
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="min-h-11 rounded-full bg-raised px-3 py-2 text-xs font-semibold transition enabled:hover:bg-highlight disabled:opacity-30 sm:px-5 sm:text-sm"
          >
            {t("common.previous")}
          </button>
          <span className="whitespace-nowrap text-xs tabular-nums text-ink-mute sm:text-sm">{t("common.pageOf", { page, pages: lastPage })}</span>
          <button
            disabled={page >= lastPage}
            onClick={() => onPage(page + 1)}
            className="min-h-11 rounded-full bg-raised px-3 py-2 text-xs font-semibold transition enabled:hover:bg-highlight disabled:opacity-30 sm:px-5 sm:text-sm"
          >
            {t("common.next")}
          </button>
        </div>
      )}
    </div>
  );
}
