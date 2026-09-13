"use client";

import { Crown, LoaderCircle, Pause, Play, RadioTower } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/format";
import { broadcastRecordingTrack } from "@/lib/tracks";
import type { BroadcastRecording } from "@/lib/types";
import { useAuth } from "@/stores/auth";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";
import { localizedText, useTranslation } from "@/lib/i18n";

export default function RecordedBroadcastTable({ recordings }: { recordings: BroadcastRecording[] }) {
  const { locale, t } = useTranslation();
  const token = useAuth((state) => state.token);
  const user = useAuth((state) => state.user);
  const entitlements = useAuth((state) => state.entitlements);
  const currentKey = usePlayer((state) => state.queue[state.index]?.key);
  const status = usePlayer((state) => state.status);
  const playTrack = usePlayer((state) => state.playTrack);
  const toggle = usePlayer((state) => state.toggle);
  const { openLoginPrompt, openUpgradePrompt } = useUi();
  const isPremium = entitlements?.is_premium ?? user?.is_premium ?? false;

  function listen(recording: BroadcastRecording) {
    if (!token) {
      openLoginPrompt(t("catalogue.oldBroadcastLogin"));
      return;
    }
    if (!isPremium) {
      openUpgradePrompt({
        title: t("catalogue.oldBroadcastPremiumTitle"),
        body: t("catalogue.oldBroadcastPremiumBody"),
      });
      return;
    }

    const track = broadcastRecordingTrack(recording);
    if (currentKey === track.key) {
      toggle();
      return;
    }
    playTrack(track);
  }

  return (
    <div className="rounded-panel border border-edge bg-elev">
      <div className="divide-y divide-edge md:hidden">
        {recordings.map((recording) => {
          const key = `broadcast_recording:${recording.id}`;
          const active = currentKey === key;
          const playing = active && status === "playing";
          const loading = active && status === "loading";
          const started = recording.started_at ? new Date(recording.started_at) : null;

          return (
            <button
              key={recording.id}
              type="button"
              onClick={() => listen(recording)}
              aria-label={`${playing ? t("player.pause") : t("player.play")} ${localizedText(recording as unknown as Record<string, unknown>, "title", locale)}`}
              className={`flex min-h-24 w-full items-center gap-3 p-3 text-left transition hover:bg-highlight/70 ${active ? "bg-accent/10" : ""}`}
            >
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${active ? "bg-accent text-accent-fg" : "bg-accent/15 text-accent"}`}>
                {loading ? <LoaderCircle className="size-5 animate-spin" /> : playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 translate-x-px fill-current" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`clamp-2 block text-sm font-semibold ${active ? "text-accent" : "text-ink"}`}>{localizedText(recording as unknown as Record<string, unknown>, "title", locale)}</span>
                <span className="mt-1 block truncate text-xs text-ink-soft">{localizedText(recording.channel as unknown as Record<string, unknown>, "title", locale)}</span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-mute">
                  <span>{formatDate(recording.started_at, locale)}{started ? ` · ${started.toLocaleTimeString(locale === "bn" ? "bn-BD" : "en-BD", { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
                  <span>{formatDuration(recording.duration_seconds)}</span>
                  <span>{t("catalogue.peak", { count: recording.peak_listeners })}</span>
                </span>
              </span>
              <Crown className="size-4 shrink-0 text-premium" aria-label={t("catalogue.premium")} />
            </button>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[820px] text-left">
        <thead className="border-b border-edge bg-raised/70 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
          <tr>
            <th className="px-4 py-3">{t("catalogue.recording")}</th>
            <th className="px-4 py-3">{t("catalogue.channel")}</th>
            <th className="px-4 py-3">{t("catalogue.broadcastDate")}</th>
            <th className="px-4 py-3">{t("catalogue.length")}</th>
            <th className="px-4 py-3">{t("catalogue.listeners")}</th>
            <th className="px-4 py-3 text-right">{t("catalogue.play")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {recordings.map((recording) => {
            const key = `broadcast_recording:${recording.id}`;
            const active = currentKey === key;
            const playing = active && status === "playing";
            const loading = active && status === "loading";
            const started = recording.started_at ? new Date(recording.started_at) : null;

            return (
              <tr
                key={recording.id}
                role="button"
                tabIndex={0}
                aria-label={`${playing ? t("player.pause") : t("player.play")} ${localizedText(recording as unknown as Record<string, unknown>, "title", locale)}`}
                onClick={() => listen(recording)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    listen(recording);
                  }
                }}
                className={`cursor-pointer transition hover:bg-highlight/70 focus-visible:outline-2 focus-visible:outline-accent ${
                  active ? "bg-accent/10" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${active ? "bg-accent text-accent-fg" : "bg-accent/15 text-accent"}`}>
                      {loading ? <LoaderCircle className="size-4 animate-spin" /> : playing ? <Pause className="size-4 fill-current" /> : <RadioTower className="size-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className={`block max-w-xs truncate text-sm font-semibold ${active ? "text-accent" : "text-ink"}`}>
                        {localizedText(recording as unknown as Record<string, unknown>, "title", locale)}
                      </span>
                      <span className="block truncate text-xs text-ink-mute">{recording.broadcaster || "Bangladesh Betar"}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="block max-w-52 truncate text-sm text-ink-soft">{localizedText(recording.channel as unknown as Record<string, unknown>, "title", locale)}</span>
                  <span className="block max-w-52 truncate text-xs text-ink-mute">{recording.channel.station || "Bangladesh Betar"}</span>
                </td>
                <td className="px-4 py-3 text-sm text-ink-soft">
                  <span className="block">{formatDate(recording.started_at, locale)}</span>
                  {started && <span className="block text-xs text-ink-mute">{started.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-ink-soft">{formatDuration(recording.duration_seconds)}</td>
                <td className="px-4 py-3 text-sm tabular-nums text-ink-soft">{t("catalogue.peak", { count: recording.peak_listeners })}</td>
                <td className="px-4 py-3">
                  <span className="ml-auto flex w-fit items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-premium/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-premium">
                      <Crown className="size-3" /> {t("catalogue.premium")}
                    </span>
                    <span className={`flex size-8 items-center justify-center rounded-full ${active ? "bg-accent text-accent-fg" : "bg-ink text-page"}`}>
                      {loading ? <LoaderCircle className="size-4 animate-spin" /> : playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 translate-x-px fill-current" />}
                    </span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
