"use client";

import { ChevronDown, ListOrdered } from "lucide-react";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/Misc";
import { formatDuration } from "@/lib/format";
import { useAsset } from "@/lib/hooks";
import { useCurrentTrack, usePlayer, type PlayerTrack } from "@/stores/player";

type Chapter = { title: string; start_seconds: number };

/**
 * Chapters for any page that plays a single audio asset. It resolves the
 * asset's chapter markers by id (fetched only when not passed in) and renders a
 * collapsible, click-to-jump list that highlights the chapter now playing.
 * Clicking a chapter seeks when this asset is the current track, otherwise it
 * starts playback from that chapter.
 */
export default function Chapters({
  assetId,
  track,
  chapters: chaptersProp,
}: {
  assetId: number | null | undefined;
  track: PlayerTrack | null;
  chapters?: Chapter[] | null;
}) {
  const [open, setOpen] = useState(true);
  const position = usePlayer((s) => s.position);
  const seek = usePlayer((s) => s.seek);
  const playTrack = usePlayer((s) => s.playTrack);
  const current = useCurrentTrack();

  // Fetch the asset for its chapters when they weren't supplied. useAsset skips
  // the request when the id is null, and dedupes with the page's own fetch.
  const { data } = useAsset(chaptersProp ? null : assetId ?? null);
  const chapters = chaptersProp ?? data?.data.chapters ?? null;

  if (!assetId || !chapters || chapters.length === 0) return null;
  const isCurrent = current?.assetId === assetId;

  return (
    <section>
      <SectionHeading
        title={<span className="flex items-center gap-2"><ListOrdered className="size-5 text-accent" /> Chapters</span>}
        action={
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Collapse chapters" : "Expand chapters"}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-mute transition hover:bg-raised hover:text-ink"
          >
            {open ? "Hide" : "Show"}
            <ChevronDown className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`} />
          </button>
        }
      />
      {open && (
        <div className="flex flex-col">
          {chapters.map((ch, i) => {
            const nextStart = chapters[i + 1]?.start_seconds ?? Infinity;
            const active = isCurrent && position >= ch.start_seconds && position < nextStart;
            return (
              <button
                key={i}
                onClick={() => {
                  if (isCurrent) seek(ch.start_seconds);
                  else if (track) playTrack({ ...track, startAt: ch.start_seconds });
                }}
                className={`flex items-center gap-4 rounded-card px-3 py-2.5 text-left transition ${active ? "bg-raised" : "hover:bg-raised"}`}
              >
                <span className="w-12 text-xs tabular-nums text-accent">{formatDuration(ch.start_seconds)}</span>
                <span className={`flex-1 text-sm ${active ? "font-semibold text-ink" : "font-medium"}`}>{ch.title}</span>
                {active && <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Playing</span>}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
