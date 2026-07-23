"use client";

import { Headphones, Loader2, Radio, RadioTower, Square } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Skeleton } from "@/components/ui/Misc";
import { artworkCss, artworkFor } from "@/lib/artwork";
import { altTitle, displayTitle, formatCount, timeAgo } from "@/lib/format";
import { useLiveChannel } from "@/lib/hooks";
import { useLive } from "@/stores/live";
import { useUi } from "@/stores/ui";

export default function LiveChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useLiveChannel(id);
  const locale = useUi((s) => s.locale);

  const channel = data?.data;
  const status = useLive((s) => s.status);
  const activeId = useLive((s) => s.channelId);
  const connect = useLive((s) => s.connect);
  const disconnect = useLive((s) => s.disconnect);

  if (isLoading && !channel) {
    return <Skeleton className="h-72 w-full rounded-panel" />;
  }

  if (!channel) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Radio className="size-10 text-ink-mute" />
        <p className="font-display text-lg font-semibold">Channel not found</p>
        <Link href="/live" className="text-sm font-semibold text-accent hover:underline">
          Back to Live Radio
        </Link>
      </div>
    );
  }

  const title = displayTitle(channel, locale);
  const alt = altTitle(channel, locale);
  const isThisPlaying = activeId === channel.id && (status === "live" || status === "connecting");
  const connecting = activeId === channel.id && status === "connecting";

  const onToggle = () => {
    if (isThisPlaying) disconnect();
    else connect(channel.id, title);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div
          className="relative flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-panel shadow-xl sm:size-56"
          style={artworkCss(artworkFor("live_channel", channel.id))}
        >
          <RadioTower className="size-20 text-white/85" />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-mute">
            <Radio className="size-4" /> Live radio channel
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {alt && <p className="font-bangla text-lg text-ink-soft">{alt}</p>}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
            {channel.is_live ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-flag">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-flag opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-flag" />
                </span>
                LIVE
              </span>
            ) : (
              <span className="font-semibold text-ink-mute">Offline</span>
            )}
            {channel.station && <span>· {channel.station}</span>}
            {channel.broadcaster && <span>· {channel.broadcaster}</span>}
            {channel.is_live && (
              <span className="inline-flex items-center gap-1">
                · <Headphones className="size-3.5" /> {formatCount(channel.listener_count)} listening
              </span>
            )}
            {channel.started_at && channel.is_live && <span>· on air {timeAgo(channel.started_at)}</span>}
          </div>
        </div>
      </div>

      {/* Listen control */}
      <div>
        {channel.is_live ? (
          <button
            onClick={onToggle}
            disabled={connecting}
            className={`inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-sm font-bold transition disabled:opacity-70 ${
              isThisPlaying
                ? "bg-highlight text-ink hover:bg-raised"
                : "bg-accent text-accent-fg hover:scale-105 hover:bg-accent-hover"
            }`}
          >
            {connecting ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Connecting…
              </>
            ) : isThisPlaying ? (
              <>
                <Square className="size-5 fill-current" /> Stop listening
              </>
            ) : (
              <>
                <Headphones className="size-5" /> Listen live
              </>
            )}
          </button>
        ) : (
          <div className="rounded-panel border border-dashed border-edge px-5 py-6 text-sm text-ink-soft">
            This channel is not broadcasting right now. Live audio will start here as soon as it goes on air.
          </div>
        )}
      </div>

      {channel.description && (
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">{channel.description}</p>
      )}
    </div>
  );
}
