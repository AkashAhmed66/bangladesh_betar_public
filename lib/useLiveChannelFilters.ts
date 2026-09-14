"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { LiveChannel, WatchLiveChannel } from "@/lib/types";

type Channel = LiveChannel | WatchLiveChannel;
export type ChannelStation = { id: string; label: string };

export function channelStationLabel(channel: Pick<Channel, "station" | "station_bn">, locale: Locale) {
  return (locale === "bn" ? channel.station_bn?.trim() : "") || channel.station || "";
}

const normalizeSearch = (text: string) => text.normalize("NFKC").toLocaleLowerCase().trim();

/** Both catalogues use the complete polled list, so filtering needs no extra requests. */
export function useLiveChannelFilters<T extends Channel>(channels: T[], locale: Locale) {
  const [query, setQuery] = useState("");
  const [stationId, setStationId] = useState("");

  // Build options before filtering so a search never removes another station.
  const stations = useMemo(() => {
    const options = new Map<string, ChannelStation>();
    for (const channel of channels) {
      const label = channelStationLabel(channel, locale);
      if (channel.station_id != null && label) {
        const id = String(channel.station_id);
        options.set(id, { id, label });
      }
    }
    return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, locale));
  }, [channels, locale]);

  const filteredChannels = useMemo(() => {
    const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
    return channels.filter((channel) => {
      if (stationId && String(channel.station_id) !== stationId) return false;
      const searchable = normalizeSearch([
        channel.title, channel.title_bn, channel.description, channel.description_bn,
        channel.station, channel.station_bn, channel.session_title, channel.broadcaster,
      ].filter(Boolean).join(" "));
      return terms.every((term) => searchable.includes(term));
    });
  }, [channels, query, stationId]);

  const reset = () => {
    setQuery("");
    setStationId("");
  };

  return { query, setQuery, stationId, setStationId, stations, filteredChannels, reset };
}
