"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useWatchlist } from "@/lib/watchlist";

export default function WatchlistFloatingButton() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data } = useWatchlist();
  const count = data?.data.length ?? 0;

  if (pathname === "/watch/watchlist") return null;

  return (
    <Link
      href="/watch/watchlist"
      aria-label={t("watch.myWatchlist")}
      title={t("watch.myWatchlist")}
      className="group fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-40 grid size-14 place-items-center rounded-full border border-white/15 bg-[var(--portal-color)] text-[var(--portal-on-color)] shadow-xl shadow-black/25 transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--portal-color)] sm:right-7"
    >
      <Bookmark className="size-6" aria-hidden="true" />
      {count > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-elev bg-ink px-1 text-[10px] font-black leading-4 text-page">{count > 99 ? "99+" : count}</span>}
      <span aria-hidden="true" className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full border border-edge bg-raised px-3 py-2 text-xs font-bold text-ink opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">{t("watch.myWatchlist")}</span>
    </Link>
  );
}
