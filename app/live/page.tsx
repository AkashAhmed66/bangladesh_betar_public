"use client";

import { Headphones, Radio, RadioTower } from "lucide-react";
import Link from "next/link";
import ListenPageHero from "@/components/cards/ListenPageHero";
import RecordedBroadcasts from "@/components/live/RecordedBroadcasts";
import LiveChannelFilters, { LiveChannelNoResults } from "@/components/live/LiveChannelFilters";
import Artwork from "@/components/ui/Artwork";
import { EmptyState, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { displayTitle, formatCount } from "@/lib/format";
import { useLiveChannels } from "@/lib/hooks";
import type { LiveChannel } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { channelStationLabel, useLiveChannelFilters } from "@/lib/useLiveChannelFilters";
import { useLive } from "@/stores/live";

export default function LivePage() {
  const { locale, t } = useTranslation();
  const { data, isLoading } = useLiveChannels();
  const channels = data?.data ?? [];
  const filters = useLiveChannelFilters(channels, locale);
  const hasLiveChannel = channels.some((channel) => channel.is_live);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <ListenPageHero
        eyebrow={t("listen.liveAcross")}
        title={t("listen.radioHero")}
        description={t("listen.radioDescription")}
        icon={<RadioTower className="size-3.5" />}
        meta={t(channels.length === 1 ? "listen.channelAvailable" : "listen.channelsAvailable", { count: channels.length })}
        actions={<a href="#previous-broadcasts" className="inline-flex min-h-11 items-center rounded-full bg-[var(--portal-color)] px-5 text-sm font-black text-white shadow-lg shadow-[var(--accent-glow)] transition hover:-translate-y-0.5">{t("listen.browseBroadcasts")}</a>}
      />
      <SectionHeading
        title={
          <span className="flex items-center gap-3">
            {t("listenNav.liveRadio")}
            {hasLiveChannel && <span className="inline-flex items-center gap-1.5 rounded-full bg-flag/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-flag">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-flag opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-flag" />
              </span>
              {t("listen.onAirNow")}
            </span>}
          </span>
        }
      />

      {channels.length > 0 && (
        <LiveChannelFilters
          query={filters.query}
          onQueryChange={filters.setQuery}
          stationId={filters.stationId}
          onStationChange={filters.setStationId}
          stations={filters.stations}
          resultCount={filters.filteredChannels.length}
          totalCount={channels.length}
          onReset={filters.reset}
          loading={isLoading}
        />
      )}

      {isLoading && !data ? (
        <div className="grid grid-cols-1 gap-5 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <EmptyState
          icon={<Radio className="size-10" />}
          title={t("liveRadio.noChannels")}
          subtitle={t("liveRadio.noChannelsDescription")}
        />
      ) : filters.filteredChannels.length === 0 ? <LiveChannelNoResults onReset={filters.reset} /> : (
        <div className="grid grid-cols-1 gap-5 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filters.filteredChannels.map((c) => (
            <LiveCard key={c.id} channel={c} title={displayTitle(c, locale)} />
          ))}
        </div>
      )}

      <RecordedBroadcasts />
    </div>
  );
}

function LiveCard({ channel, title }: { channel: LiveChannel; title: string }) {
  const { locale, t } = useTranslation();
  const status = useLive((state) => state.status);
  const activeId = useLive((state) => state.channelId);
  const connect = useLive((state) => state.connect);
  const disconnect = useLive((state) => state.disconnect);
  const isThisPlaying = activeId === channel.id && (status === "live" || status === "connecting");
  const isConnecting = activeId === channel.id && status === "connecting";
  const listen = () => {
    if (!channel.is_live) return;
    if (isThisPlaying) {
      disconnect();
      return;
    }
    void connect(channel.id, title);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-panel border border-edge bg-raised/70 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-edge-strong hover:bg-raised hover:shadow-xl">
      <Link href={`/live/${channel.id}`} className="flex flex-col gap-4">
        <div className="relative">
        <Artwork
          type="live_channel"
          id={channel.id}
          url={channel.artwork_url}
          title={title}
          className="aspect-square w-full"
        />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-shade/65 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
          <span className="relative flex size-1.5">
            {channel.is_live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-flag opacity-75" />}
            <span className={`relative inline-flex size-1.5 rounded-full ${channel.is_live ? "bg-flag" : "bg-ink-mute"}`} />
          </span>
          {channel.is_live ? t("liveRadio.live") : t("liveRadio.offAir")}
        </span>
        {channel.is_live && <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-shade/65 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
          <Headphones className="size-3" /> {formatCount(channel.listener_count)}
        </span>}
        </div>
        <div className="min-w-0">
          <p className="clamp-1 font-display text-lg font-bold tracking-tight">{title}</p>
          <p className="clamp-1 text-xs text-ink-soft">
            {channelStationLabel(channel, locale) || t("brand.name")}
          </p>
          {channel.is_live && channel.session_title && <p className="mt-1 clamp-1 text-xs text-ink-mute">{channel.session_title}</p>}
        </div>
      </Link>
      {channel.is_live ? <button
        type="button"
        onClick={listen}
        disabled={isConnecting}
        className={`mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black transition disabled:opacity-60 ${isThisPlaying ? "bg-highlight text-ink" : "bg-[var(--portal-color)] text-[var(--portal-on-color)] hover:opacity-90"}`}
      >
        <Headphones className="size-4" /> {isConnecting ? t("liveRadio.connecting") : isThisPlaying ? t("liveRadio.stopListening") : t("liveRadio.listenLive")}
      </button> : <p className="mt-4 rounded-card bg-sunken px-3 py-2 text-center text-xs font-semibold text-ink-mute">{t("liveRadio.notBroadcasting")}</p>}
    </article>
  );
}
