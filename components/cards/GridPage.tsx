"use client";

import MediaCard from "./MediaCard";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import type { CatalogueItem, Paginated } from "@/lib/types";

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
  title, subtitle, data, isLoading, page, onPage, emptyTitle = "Nothing here yet", filters,
}: GridPageProps<T>) {
  const items = data?.data ?? [];
  const lastPage = data?.meta?.last_page ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>

      {filters}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:flex sm:flex-wrap sm:gap-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="min-w-0 p-2 sm:w-44 sm:shrink-0 sm:p-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="mt-3 h-3.5 w-3/4" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:-mx-3 sm:flex sm:flex-wrap sm:gap-0">
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
            Previous
          </button>
          <span className="whitespace-nowrap text-xs tabular-nums text-ink-mute sm:text-sm">{page} / {lastPage}<span className="sr-only"> pages</span></span>
          <button
            disabled={page >= lastPage}
            onClick={() => onPage(page + 1)}
            className="min-h-11 rounded-full bg-raised px-3 py-2 text-xs font-semibold transition enabled:hover:bg-highlight disabled:opacity-30 sm:px-5 sm:text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
