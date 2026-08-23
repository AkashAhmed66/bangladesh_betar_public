"use client";

/* eslint-disable @next/next/no-img-element */
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Headphones, Image as ImageIcon, Newspaper, SquarePlay, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import type { NewsArticleMedia, NewsMediaType } from "@/lib/types";

const TYPE_ORDER: NewsMediaType[] = ["image", "video", "youtube", "audio", "document"];

const TYPE_LABEL_KEYS: Record<NewsMediaType, { singular: string; plural: string }> = {
  image: { singular: "newsMedia.image", plural: "newsMedia.images" },
  video: { singular: "newsMedia.video", plural: "newsMedia.videos" },
  youtube: { singular: "newsMedia.youtube", plural: "newsMedia.youtube" },
  audio: { singular: "newsMedia.audio", plural: "newsMedia.audio" },
  document: { singular: "newsMedia.document", plural: "newsMedia.documents" },
};

const TYPE_ICONS = {
  image: ImageIcon,
  video: Video,
  youtube: SquarePlay,
  audio: Headphones,
  document: FileText,
} satisfies Record<NewsMediaType, typeof ImageIcon>;

function humanSize(bytes: number | null): string | null {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaContent({ item, articleTitle }: { item: NewsArticleMedia; articleTitle: string }) {
  const { t } = useTranslation();
  if (item.type === "image") {
    return <img src={item.url} alt={item.name || t("newsMedia.editorialImage", { title: articleTitle })} className="size-full object-contain" />;
  }

  if (item.type === "video") {
    return (
      <video key={item.url} controls preload="metadata" className="size-full bg-black object-contain">
        <source src={item.url} type={item.mime_type ?? undefined} />
        {t("newsMedia.unsupportedVideo")}
      </video>
    );
  }

  if (item.type === "youtube") {
    if (!item.embed_url) {
      return (
        <div className="grid size-full place-items-center bg-sunken p-6 text-center">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#ff0033] px-5 text-sm font-black text-white">
            {t("newsMedia.openYoutube")} <ExternalLink className="size-4" />
          </a>
        </div>
      );
    }

    return (
      <iframe
        src={item.embed_url}
        title={t("newsMedia.youtubeTitle", { title: articleTitle })}
        className="size-full border-0 bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  if (item.type === "audio") {
    return (
      <div className="relative grid size-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_30%,color-mix(in_srgb,var(--portal-color)_32%,transparent),transparent_55%),var(--bg-sunken)] px-6">
        <div aria-hidden className="absolute inset-x-0 bottom-0 flex h-2/3 items-end justify-center gap-2 opacity-30">
          {[42, 68, 34, 88, 58, 100, 72, 46, 82, 52, 92, 62, 38, 76].map((height, index) => (
            <span key={`${height}-${index}`} className="w-2 rounded-t-full bg-[var(--portal-color)]" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="relative w-full max-w-2xl rounded-panel border border-white/10 bg-black/45 p-6 text-center text-white shadow-2xl backdrop-blur-xl sm:p-9">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--portal-color)]"><Headphones className="size-6" /></span>
          <p className="mt-4 truncate font-display text-xl font-bold">{item.name}</p>
          <p className="mt-1 text-xs text-white/60">{t("newsMedia.supportingAudio")}</p>
          <audio key={item.url} controls preload="metadata" className="mt-6 w-full" src={item.url}>{t("newsMedia.unsupportedAudio")}</audio>
        </div>
      </div>
    );
  }

  const isPdf = item.mime_type === "application/pdf" || item.name.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    return <iframe src={item.url} title={item.name} className="size-full border-0 bg-white" />;
  }

  return (
    <div className="grid size-full place-items-center bg-[linear-gradient(135deg,var(--bg-sunken),var(--bg-raised))] p-6 text-center">
      <div className="max-w-lg">
        <span className="mx-auto grid size-20 place-items-center rounded-panel border border-edge bg-elev text-[var(--portal-color)] shadow-xl"><FileText className="size-9" /></span>
        <h3 className="mt-5 break-words font-display text-2xl font-bold">{item.name}</h3>
        <p className="mt-2 text-sm text-ink-mute">{t("newsMedia.documentDescription")}</p>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--portal-color)] px-5 text-sm font-black text-white transition hover:-translate-y-0.5">
          {t("newsMedia.openDocument")} <ExternalLink className="size-4" />
        </a>
      </div>
    </div>
  );
}

export default function NewsMediaGallery({ media, articleTitle }: { media: NewsArticleMedia[]; articleTitle: string }) {
  const { t } = useTranslation();
  const grouped = useMemo(
    () => Object.fromEntries(TYPE_ORDER.map((type) => [type, media.filter((item) => item.type === type)])) as Record<NewsMediaType, NewsArticleMedia[]>,
    [media],
  );
  const availableTypes = TYPE_ORDER.filter((type) => grouped[type].length > 0);
  const [activeType, setActiveType] = useState<NewsMediaType>(availableTypes[0] ?? "image");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItems = grouped[activeType] ?? [];
  const activeItem = activeItems[activeIndex] ?? activeItems[0];

  const changeType = (type: NewsMediaType) => {
    setActiveType(type);
    setActiveIndex(0);
  };

  const move = (direction: -1 | 1) => {
    if (activeItems.length < 2) return;
    setActiveIndex((current) => (current + direction + activeItems.length) % activeItems.length);
  };

  if (!activeItem) {
    return (
      <div className="grid aspect-video place-items-center bg-sunken text-ink-mute">
        <Newspaper className="size-16" />
      </div>
    );
  }

  return (
    <figure
      className="relative -mt-px overflow-hidden rounded-b-panel border-x border-b border-edge bg-sunken shadow-2xl shadow-shade/20"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
      }}
      tabIndex={0}
      aria-label={t("newsMedia.gallery", { title: articleTitle })}
    >
      <div className="relative aspect-[16/10] min-h-[19rem] sm:aspect-[16/9] lg:aspect-[2/1]">
        <MediaContent item={activeItem} articleTitle={articleTitle} />

        {activeItems.length > 1 && (
          <>
            <button type="button" onClick={() => move(-1)} aria-label={t("newsMedia.previous", { type: t(TYPE_LABEL_KEYS[activeType].singular).toLowerCase() })} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55 text-white shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-[var(--portal-color)] sm:left-5 sm:size-13">
              <ChevronLeft className="size-6" />
            </button>
            <button type="button" onClick={() => move(1)} aria-label={t("newsMedia.next", { type: t(TYPE_LABEL_KEYS[activeType].singular).toLowerCase() })} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55 text-white shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-[var(--portal-color)] sm:right-5 sm:size-13">
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      <figcaption className="flex flex-col gap-3 border-t border-edge bg-raised px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={t("newsMedia.types")}>
          {availableTypes.map((type) => {
            const Icon = TYPE_ICONS[type];
            const count = grouped[type].length;
            const active = type === activeType;
            return (
              <button key={type} type="button" role="tab" aria-selected={active} onClick={() => changeType(type)} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-black transition ${active ? "bg-[var(--portal-color)] text-white shadow-lg shadow-[var(--accent-glow)]" : "border border-edge bg-elev text-ink-soft hover:border-edge-strong hover:text-ink"}`}>
                <Icon className="size-3.5" /> {t(count === 1 ? TYPE_LABEL_KEYS[type].singular : TYPE_LABEL_KEYS[type].plural)} <span className={active ? "text-white/75" : "text-ink-mute"}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex min-w-0 items-center justify-between gap-4 text-xs text-ink-mute sm:justify-end">
          <span className="max-w-64 truncate">{activeItem.name}</span>
          <span className="shrink-0 tabular-nums">{activeIndex + 1} / {activeItems.length}{humanSize(activeItem.size_bytes) ? ` / ${humanSize(activeItem.size_bytes)}` : ""}</span>
        </div>
      </figcaption>
    </figure>
  );
}
