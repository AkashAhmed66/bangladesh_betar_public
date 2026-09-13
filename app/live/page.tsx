"use client";

import { Headphones, Radio, RadioTower } from "lucide-react";
import Link from "next/link";
import ListenPageHero from "@/components/cards/ListenPageHero";
import RecordedBroadcasts from "@/components/live/RecordedBroadcasts";
import Artwork from "@/components/ui/Artwork";
import { EmptyState, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { displayTitle, formatCount } from "@/lib/format";
import { useLiveChannels } from "@/lib/hooks";
import type { LiveChannel } from "@/lib/types";
import { useUi } from "@/stores/ui";
import { useTranslation } from "@/lib/i18n";

export default function LivePage() {
  const { t } = useTranslation();
  const { data, isLoading } = useLiveChannels();
  const locale = useUi((s) => s.locale);
  const channels = data?.data ?? [];

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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-flag/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-flag">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-flag opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-flag" />
              </span>
              {t("listen.onAirNow")}
            </span>
          </span>
        }
      />

      {isLoading && !data ? (
        <div className="grid grid-cols-1 gap-5 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <EmptyState
          icon={<Radio className="size-10" />}
          title={t("listen.noLive")}
          subtitle={t("listen.noLiveDescription")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {channels.map((c) => (
            <LiveCard key={c.id} channel={c} title={displayTitle(c, locale)} />
          ))}
        </div>
      )}

      <RecordedBroadcasts />
    </div>
  );
}

function LiveCard({ channel, title }: { channel: LiveChannel; title: string }) {
  const { t } = useTranslation();
  return (
    <Link
      href={`/live/${channel.id}`}
      className="group flex flex-col gap-4 overflow-hidden rounded-panel border border-edge bg-raised/70 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-edge-strong hover:bg-raised hover:shadow-xl"
    >
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
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-flag opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-flag" />
          </span>
          {t("shell.live")}
        </span>
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-shade/65 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
          <Headphones className="size-3" /> {formatCount(channel.listener_count)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="clamp-1 font-display text-lg font-bold tracking-tight">{title}</p>
        <p className="clamp-1 text-xs text-ink-soft">
          {channel.station ?? channel.broadcaster ?? t("brand.name")}
        </p>
      </div>
    </Link>
  );
}
