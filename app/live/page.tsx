"use client";

import { Headphones, Radio, RadioTower } from "lucide-react";
import Link from "next/link";
import { EmptyState, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { artworkCss, artworkFor } from "@/lib/artwork";
import { displayTitle, formatCount } from "@/lib/format";
import { useLiveChannels } from "@/lib/hooks";
import type { LiveChannel } from "@/lib/types";
import { useUi } from "@/stores/ui";

export default function LivePage() {
  const { data, isLoading } = useLiveChannels();
  const locale = useUi((s) => s.locale);
  const channels = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title={
          <span className="flex items-center gap-3">
            Live Radio
            <span className="inline-flex items-center gap-1.5 rounded-full bg-flag/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-flag">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-flag opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-flag" />
              </span>
              On air now
            </span>
          </span>
        }
      />

      <p className="-mt-2 max-w-2xl text-sm text-ink-soft">
        Tune in to Bangladesh Betar channels broadcasting live right now. Broadcasts start and stop
        throughout the day — this page updates automatically.
      </p>

      {isLoading && !data ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <EmptyState
          icon={<Radio className="size-10" />}
          title="No channels are live right now"
          subtitle="Check back soon — live broadcasts appear here the moment a channel goes on air."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {channels.map((c) => (
            <LiveCard key={c.id} channel={c} title={displayTitle(c, locale)} />
          ))}
        </div>
      )}
    </div>
  );
}

function LiveCard({ channel, title }: { channel: LiveChannel; title: string }) {
  return (
    <Link
      href={`/live/${channel.id}`}
      className="group flex flex-col gap-3 rounded-panel bg-elev p-3 transition hover:bg-raised"
    >
      <div
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card"
        style={artworkCss(artworkFor("live_channel", channel.id))}
      >
        <RadioTower className="size-14 text-white/85" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-flag opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-flag" />
          </span>
          Live
        </span>
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
          <Headphones className="size-3" /> {formatCount(channel.listener_count)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="clamp-1 font-semibold">{title}</p>
        <p className="clamp-1 text-xs text-ink-soft">
          {channel.station ?? channel.broadcaster ?? "Bangladesh Betar"}
        </p>
      </div>
    </Link>
  );
}
