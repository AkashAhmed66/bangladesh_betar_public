"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function OfflinePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-raised text-ink-mute">
        <WifiOff className="size-8" />
      </span>
      <h1 className="font-display text-2xl font-bold">{t("libraryPages.offlineTitle")}</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        {t("libraryPages.offlineDescription")}
      </p>
      <Link
        href="/downloads"
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-fg transition hover:scale-105"
      >
        {t("libraryPages.goDownloads")}
      </Link>
    </div>
  );
}
