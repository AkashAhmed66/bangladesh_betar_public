"use client";

import { ChevronDown, ChevronUp, ListX, Play, X } from "lucide-react";
import Artwork from "@/components/ui/Artwork";
import { formatDuration } from "@/lib/format";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";
import { useTranslation } from "@/lib/i18n";

export default function QueuePanel() {
  const { t } = useTranslation();
  const { queue, index, contextLabel, jumpTo, removeAt, clearQueue, moveInQueue } = usePlayer();
  const { toggleQueuePanel, locale } = useUi();

  const upNext = queue.slice(index + 1);
  const current = queue[index];

  return (
    <aside
      aria-label={t("player.listeningQueue")}
      className="queue-panel-drawer absolute inset-y-0 right-0 z-40 hidden w-80 flex-col border-l border-edge bg-page/92 p-2 shadow-2xl shadow-shade/40 backdrop-blur-xl md:flex"
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-panel border border-edge bg-elev">
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <h2 className="font-display text-sm font-bold">{t("player.queue")}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={clearQueue}
              aria-label={t("player.clearQueue")}
              title={t("player.clearQueue")}
              className="rounded-full p-1.5 text-ink-mute transition hover:bg-highlight hover:text-ink"
            >
              <ListX className="size-4" />
            </button>
            <button
              onClick={toggleQueuePanel}
              aria-label={t("player.closeQueue")}
              className="rounded-full p-1.5 text-ink-mute transition hover:bg-highlight hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {current && (
            <>
              <p className="px-2 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                {t("player.nowPlaying")}
              </p>
              <QueueRow
                title={locale === "bn" && current.titleBn ? current.titleBn : current.title}
                subtitle={current.subtitle}
                type={current.type}
                id={current.id}
                artworkUrl={current.artworkUrl}
                duration={current.duration}
                active
              />
            </>
          )}

          <p className="px-2 pb-1 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-mute">
            {t("player.upNext")} {contextLabel ? `· ${t("player.fromContext", { context: contextLabel })}` : ""}
          </p>
          {upNext.length === 0 && <p className="px-2 py-3 text-xs text-ink-mute">{t("player.queueEmpty")}</p>}
          {upNext.map((t, i) => {
            const pos = index + 1 + i;
            return (
              <QueueRow
                key={`${t.key}-${i}`}
                title={locale === "bn" && t.titleBn ? t.titleBn : t.title}
                subtitle={t.subtitle}
                type={t.type}
                id={t.id}
                artworkUrl={t.artworkUrl}
                duration={t.duration}
                onPlay={() => jumpTo(pos)}
                onRemove={() => removeAt(pos)}
                onMoveUp={i > 0 ? () => moveInQueue(pos, pos - 1) : undefined}
                onMoveDown={i < upNext.length - 1 ? () => moveInQueue(pos, pos + 1) : undefined}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function QueueRow({
  title, subtitle, type, id, artworkUrl, duration, active, onPlay, onRemove, onMoveUp, onMoveDown,
}: {
  title: string;
  subtitle: string;
  type: string;
  id: number;
  artworkUrl: string | null;
  duration: number | null;
  active?: boolean;
  onPlay?: () => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={`group flex items-center gap-3 rounded-card px-2 py-2 transition ${
        active ? "bg-highlight/60" : "hover:bg-raised"
      }`}
    >
      <div className="relative shrink-0">
        <Artwork type={type} id={id} url={artworkUrl} title={title} className="size-10" />
        {onPlay && (
          <button
            onClick={onPlay}
            aria-label={`${t("player.play")} ${title}`}
            className="absolute inset-0 hidden items-center justify-center rounded-card bg-artwork-panel text-artwork-ink group-hover:flex"
          >
            <Play className="size-4 fill-current" />
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`clamp-1 text-sm font-medium ${active ? "text-accent" : ""}`}>{title}</p>
        <p className="clamp-1 text-xs text-ink-mute">{subtitle}</p>
      </div>
      {(onMoveUp || onMoveDown) && (
        <div className="hidden items-center group-hover:flex">
          <button
            onClick={onMoveUp}
            disabled={!onMoveUp}
            aria-label={t("player.moveUp")}
            className="rounded p-0.5 text-ink-mute transition hover:text-ink disabled:opacity-25"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!onMoveDown}
            aria-label={t("player.moveDown")}
            className="rounded p-0.5 text-ink-mute transition hover:text-ink disabled:opacity-25"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      )}
      <span className={`text-[11px] tabular-nums text-ink-mute ${onMoveUp || onMoveDown || onRemove ? "group-hover:hidden" : ""}`}>
        {formatDuration(duration)}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={t("player.removeFromQueue")}
          className="hidden text-ink-mute transition hover:text-danger group-hover:block"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
