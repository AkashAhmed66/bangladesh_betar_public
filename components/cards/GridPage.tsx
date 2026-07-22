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
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>

      {filters}

      {isLoading ? (
        <div className="-mx-3 flex flex-wrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-40 shrink-0 p-3 sm:w-44">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="mt-3 h-3.5 w-3/4" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <div className="-mx-3 flex flex-wrap">
          {items.map((item) => (
            <MediaCard key={`${item.type}:${item.id}`} item={item} />
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="rounded-full bg-raised px-5 py-2 text-sm font-semibold transition enabled:hover:bg-highlight disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm tabular-nums text-ink-mute">Page {page} of {lastPage}</span>
          <button
            disabled={page >= lastPage}
            onClick={() => onPage(page + 1)}
            className="rounded-full bg-raised px-5 py-2 text-sm font-semibold transition enabled:hover:bg-highlight disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
