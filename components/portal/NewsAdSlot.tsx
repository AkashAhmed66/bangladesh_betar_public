"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

type AdFormat = "leaderboard" | "rectangle" | "square" | "in-article";

const SLOT_ENV: Record<AdFormat, string | undefined> = {
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_NEWS_LEADERBOARD_SLOT,
  rectangle: process.env.NEXT_PUBLIC_ADSENSE_NEWS_RECTANGLE_SLOT,
  square: process.env.NEXT_PUBLIC_ADSENSE_NEWS_SQUARE_SLOT ?? process.env.NEXT_PUBLIC_ADSENSE_NEWS_RECTANGLE_SLOT,
  "in-article": process.env.NEXT_PUBLIC_ADSENSE_NEWS_IN_ARTICLE_SLOT,
};

export default function NewsAdSlot({ format, className = "" }: { format: AdFormat; className?: string }) {
  const { t } = useTranslation();
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = SLOT_ENV[format];
  const configured = Boolean(client && slot);

  useEffect(() => {
    if (!configured) return;
    try {
      const adsWindow = window as unknown as { adsbygoogle?: Record<string, never>[] };
      (adsWindow.adsbygoogle ??= []).push({});
    } catch {
      // Ad blockers and consent tools may intentionally prevent initialization.
    }
  }, [configured]);

  return (
    <aside
      aria-label={t("news.advertisement")}
      data-ad-placement={format}
      className={`news-ad-slot news-ad-${format} mx-auto w-full overflow-hidden ${className}`}
    >
      <span className="block pb-1 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-ink-mute">
        {t("news.advertisement")}
      </span>
      {configured ? (
        <ins
          className="adsbygoogle block size-full"
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format === "square" ? "rectangle" : "auto"}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="grid size-full place-items-center border border-dashed border-edge bg-sunken/60 px-5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-ink-mute">
          {t("news.advertisementSpace")}
        </div>
      )}
    </aside>
  );
}
