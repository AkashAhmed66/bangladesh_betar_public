"use client";

import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="min-h-11 rounded-full bg-raised px-3 py-2 text-xs font-semibold transition enabled:hover:bg-highlight disabled:opacity-30 sm:px-5 sm:text-sm"
      >
        {t("common.previous")}
      </button>
      <span className="whitespace-nowrap text-xs tabular-nums text-ink-mute sm:text-sm">{t("common.pageOf", { page, pages: totalPages })}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="min-h-11 rounded-full bg-raised px-3 py-2 text-xs font-semibold transition enabled:hover:bg-highlight disabled:opacity-30 sm:px-5 sm:text-sm"
      >
        {t("common.next")}
      </button>
    </div>
  );
}
