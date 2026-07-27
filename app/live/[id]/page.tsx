"use client";

import { Hand, Headphones, Loader2, Mic, MicOff, Radio, RadioTower, Square } from "lucide-react";
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
  const canSpeak = useLive((s) => s.canSpeak);
  const micOn = useLive((s) => s.micOn);
  const handRaised = useLive((s) => s.handRaised);
  const setMic = useLive((s) => s.setMic);
  const raiseHand = useLive((s) => s.raiseHand);
  const lowerHand = useLive((s) => s.lowerHand);

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

      {/* Listen + speak controls */}
      <div className="flex flex-col gap-3">
        {channel.is_live ? (
          <div className="flex flex-wrap items-center gap-3">
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

            {/* Speak: mic toggle once the host grants it, otherwise raise-hand. */}
            {isThisPlaying && status === "live" &&
              (canSpeak ? (
                <button
                  onClick={() => setMic(!micOn)}
                  className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-90 ${
                    micOn ? "bg-danger text-white" : "bg-flag text-white"
                  }`}
                >
                  {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
                  {micOn ? "You're on air — mute" : "Tap to speak"}
                </button>
              ) : (
                <button
                  onClick={() => (handRaised ? lowerHand() : raiseHand())}
                  className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition ${
                    handRaised
                      ? "bg-premium text-premium-fg hover:opacity-90"
                      : "border border-edge-strong text-ink hover:border-ink"
                  }`}
                >
                  <Hand className="size-5" /> {handRaised ? "Hand raised — waiting" : "Raise hand to speak"}
                </button>
              ))}
          </div>
        ) : (
          <div className="rounded-panel border border-dashed border-edge px-5 py-6 text-sm text-ink-soft">
            This channel is not broadcasting right now. Live audio will start here as soon as it goes on air.
          </div>
        )}

        {/* Helper line explaining the current speak state. */}
        {isThisPlaying && status === "live" && (
          <p className="text-xs text-ink-mute">
            {canSpeak
              ? micOn
                ? "Your microphone is live — everyone in the broadcast can hear you."
                : "The host invited you to speak. Tap “Tap to speak” and allow microphone access."
              : handRaised
                ? "Your hand is raised. The host will bring you in when they're ready."
                : "Want to join in? Raise your hand and the host can invite you to speak."}
          </p>
        )}
      </div>

      {channel.description && (
        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">{channel.description}</p>
      )}
    </div>
  );
}
