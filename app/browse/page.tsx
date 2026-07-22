"use client";

import { CalendarDays } from "lucide-react";
import SectionRow from "@/components/cards/SectionRow";
import {
  useEditorialPlaylists,
  useNewReleases,
  useOnThisDay,
  useTrending,
} from "@/lib/hooks";
import { formatDate } from "@/lib/format";

export default function BrowsePage() {
  const { data: trending, isLoading: l1 } = useTrending();
  const { data: newReleases, isLoading: l2 } = useNewReleases();
  const { data: onThisDay } = useOnThisDay();
  const { data: editorial } = useEditorialPlaylists();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Browse the archive</h1>
        <p className="mt-1 text-sm text-ink-soft">
          A century of Bangladesh Betar — trending now, fresh digitisations and curated collections.
        </p>
      </div>

      <SectionRow title="Trending now" items={trending?.data} loading={l1} />
      <SectionRow title="New to the archive" items={newReleases?.data} loading={l2} />

      {onThisDay && onThisDay.data.length > 0 && (
        <SectionRow
          title={
            <span className="flex items-center gap-2">
              <CalendarDays className="size-5 text-accent" />
              On this day · {formatDate(onThisDay.date)}
            </span>
          }
          items={onThisDay.data}
        />
      )}

      <SectionRow title="Editorial playlists" items={editorial?.data} />
    </div>
  );
}
