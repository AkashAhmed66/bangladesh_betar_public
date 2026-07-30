"use client";

/** Simple Previous / "Page X of Y" / Next control (matches the index-page pager). */
export default function Pagination({
  page,
  totalPages,
  onChange,
  className = "",
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-full bg-raised px-5 py-2 text-sm font-semibold transition enabled:hover:bg-highlight disabled:opacity-30"
      >
        Previous
      </button>
      <span className="text-sm tabular-nums text-ink-mute">Page {page} of {totalPages}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-full bg-raised px-5 py-2 text-sm font-semibold transition enabled:hover:bg-highlight disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}
