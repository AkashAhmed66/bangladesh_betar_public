"use client";

import { ListX, Play, X } from "lucide-react";
import Artwork from "@/components/ui/Artwork";
import { formatDuration } from "@/lib/format";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

export default function QueuePanel() {
  const { queue, index, contextLabel, jumpTo, removeAt, clearQueue } = usePlayer();
  const { toggleQueuePanel, locale } = useUi();

  const upNext = queue.slice(index + 1);
  const current = queue[index];

  return (
    <aside className="hidden w-80 shrink-0 flex-col p-2 pl-0 md:flex">
      <div className="flex min-h-0 flex-1 flex-col rounded-panel bg-elev">
        <div className="flex items-center justify-between border-b border-edge px-4 py-3">
          <h2 className="font-display text-sm font-bold">Queue</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={clearQueue}
              aria-label="Clear queue"
              title="Clear queue"
              className="rounded-full p-1.5 text-ink-mute transition hover:bg-highlight hover:text-ink"
            >
              <ListX className="size-4" />
            </button>
            <button
              onClick={toggleQueuePanel}
              aria-label="Close queue"
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
                Now playing
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
            Up next {contextLabel ? `· from ${contextLabel}` : ""}
          </p>
          {upNext.length === 0 && <p className="px-2 py-3 text-xs text-ink-mute">Queue is empty.</p>}
          {upNext.map((t, i) => (
            <QueueRow
              key={`${t.key}-${i}`}
              title={locale === "bn" && t.titleBn ? t.titleBn : t.title}
              subtitle={t.subtitle}
              type={t.type}
              id={t.id}
              artworkUrl={t.artworkUrl}
              duration={t.duration}
              onPlay={() => jumpTo(index + 1 + i)}
              onRemove={() => removeAt(index + 1 + i)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

function QueueRow({
  title, subtitle, type, id, artworkUrl, duration, active, onPlay, onRemove,
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
}) {
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
            aria-label={`Play ${title}`}
            className="absolute inset-0 hidden items-center justify-center rounded-card bg-black/55 group-hover:flex"
          >
            <Play className="size-4 fill-current" />
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`clamp-1 text-sm font-medium ${active ? "text-accent" : ""}`}>{title}</p>
        <p className="clamp-1 text-xs text-ink-mute">{subtitle}</p>
      </div>
      <span className="text-[11px] tabular-nums text-ink-mute">{formatDuration(duration)}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label="Remove from queue"
          className="hidden text-ink-mute transition hover:text-danger group-hover:block"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
