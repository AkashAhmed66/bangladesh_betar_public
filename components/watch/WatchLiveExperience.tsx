"use client";

/* eslint-disable @next/next/no-img-element */
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  LoaderCircle,
  Maximize,
  Play,
  Radio,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ContentActions from "@/components/engagement/ContentActions";
import { post } from "@/lib/api";
import { useWatchLiveChannels } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { LiveTokenResponse, WatchLiveChannel } from "@/lib/types";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";
import type { RemoteTrack, Room } from "livekit-client";

type ConnectionState = "idle" | "connecting" | "live" | "error";

function Viewer({ channel }: { channel: WatchLiveChannel }) {
  const { locale, t } = useTranslation();
  const token = useAuth((state) => state.token);
  const isPremium = useAuth((state) => state.entitlements?.is_premium ?? false);
  const openLoginPrompt = useUi((state) => state.openLoginPrompt);
  const openUpgradePrompt = useUi((state) => state.openUpgradePrompt);
  const roomRef = useRef<Room | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioElementsRef = useRef(new Map<string, HTMLAudioElement>());
  const [connection, setConnection] = useState<ConnectionState>("idle");
  const [muted, setMuted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const closeRoom = useCallback((updateState = true) => {
    const room = roomRef.current;
    roomRef.current = null;
    try { room?.disconnect(); } catch { /* already disconnected */ }
    audioElementsRef.current.forEach((element) => {
      element.pause();
      element.srcObject = null;
      element.remove();
    });
    audioElementsRef.current.clear();
    if (videoRef.current) videoRef.current.srcObject = null;
    if (updateState) {
      setConnection("idle");
      setMuted(false);
    }
  }, []);

  useEffect(() => () => closeRoom(false), [closeRoom]);
  useEffect(() => {
    if (!channel.is_live && connection === "live") {
      const timeout = window.setTimeout(() => {
        closeRoom();
        setMessage(t("watchLive.ended"));
      }, 0);
      return () => window.clearTimeout(timeout);
    }
  }, [channel.is_live, closeRoom, connection, t]);

  const connect = async () => {
    if (!channel.is_live || connection === "connecting") return;
    if (!token) {
      openLoginPrompt(t("watch.signInToWatchLive"));
      return;
    }
    if (!isPremium) {
      openUpgradePrompt({ title: t("watch.premiumLiveTitle"), body: t("watch.premiumLiveDescription") });
      return;
    }
    closeRoom();
    setConnection("connecting");
    setMessage(null);

    try {
      const credentials = await post<LiveTokenResponse>(`/watch-live-channels/${channel.id}/token`);
      const { Room, RoomEvent } = await import("livekit-client");
      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === "video" && videoRef.current) {
          track.attach(videoRef.current);
          videoRef.current.muted = true;
          void videoRef.current.play().catch(() => undefined);
          return;
        }

        if (track.kind === "audio") {
          const element = track.attach() as HTMLAudioElement;
          element.autoplay = true;
          element.muted = muted;
          element.style.display = "none";
          document.body.appendChild(element);
          void element.play().catch(() => undefined);
          audioElementsRef.current.set(track.sid ?? crypto.randomUUID(), element);
        }
      });
      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        if (track.kind === "video" && videoRef.current) {
          try { track.detach(videoRef.current); } catch { /* already detached */ }
          videoRef.current.srcObject = null;
        }
        if (track.kind === "audio") {
          const element = audioElementsRef.current.get(track.sid ?? "");
          if (element) {
            try { track.detach(element); } catch { /* already detached */ }
            element.remove();
            audioElementsRef.current.delete(track.sid ?? "");
          }
        }
      });
      room.on(RoomEvent.Disconnected, () => {
        if (roomRef.current === room) closeRoom();
      });

      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL || credentials.ws_url, credentials.token);
      setConnection("live");
    } catch (error) {
      console.error("Watch Live connection failed", error);
      closeRoom(false);
      setConnection("error");
      setMessage(t("watchLive.connectionFailed"));
    }
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    audioElementsRef.current.forEach((element) => { element.muted = nextMuted; });
    setMuted(nextMuted);
  };

  const toggleFullscreen = async () => {
    const target = videoRef.current?.parentElement;
    if (!target) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await target.requestFullscreen();
  };

  const connected = connection === "live";

  return (
    <div className="relative aspect-video min-h-[18rem] overflow-hidden bg-[#030708] sm:min-h-0">
      {channel.artwork_url && !connected && <img src={channel.artwork_url} alt="" className="absolute inset-0 size-full object-cover" />}
      {!connected && <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/62 to-black/20" />}
      <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 size-full bg-black object-contain transition-opacity duration-500 ${connected ? "opacity-100" : "opacity-0"}`} />

      {!connected && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {channel.is_live ? (
            <button type="button" onClick={() => void connect()} disabled={connection === "connecting"} className="group grid size-24 place-items-center rounded-full border border-white/30 bg-white text-black shadow-[0_20px_70px_rgba(0,0,0,.45)] transition hover:scale-105 disabled:opacity-70 sm:size-28" aria-label={t("watchLive.watchChannel", { channel: localizedText(channel as unknown as Record<string, unknown>, "title", locale) })}>
              {connection === "connecting" ? <LoaderCircle className="size-8 animate-spin" /> : <Play className="ml-1 size-9 fill-current transition group-hover:scale-110" />}
            </button>
          ) : (
            <div className="max-w-sm text-center text-white"><RadioTower className="mx-auto size-10 text-[#75e3df]" /><p className="mt-4 font-display text-2xl font-bold">{t("watchLive.studioOffAir")}</p><p className="mt-2 text-sm leading-relaxed text-white/60">{t("watchLive.studioOffAirDescription")}</p></div>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4 pb-12 text-white sm:p-5">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur-md ${channel.is_live ? "bg-rose-600" : "border border-white/15 bg-black/30"}`}><span className={`size-1.5 rounded-full ${channel.is_live ? "animate-pulse bg-white" : "bg-white/45"}`} /> {channel.is_live ? t("watch.liveNow") : t("watchLive.offline")}</span>
        <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] backdrop-blur-md">{t("watch.portalName")}</span>
      </div>

      {connected && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-16 text-white sm:p-5 sm:pt-20">
          <button type="button" onClick={toggleMute} className="grid size-11 place-items-center rounded-full bg-white/12 backdrop-blur-md transition hover:bg-white/22" aria-label={muted ? t("watchLive.unmute") : t("watchLive.mute")}>{muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}</button>
          <button type="button" onClick={() => closeRoom()} className="inline-flex h-11 items-center gap-2 rounded-full bg-white/12 px-4 text-xs font-black backdrop-blur-md transition hover:bg-white/22"><Square className="size-4 fill-current" /> {t("watchLive.stop")}</button>
          <button type="button" onClick={() => void toggleFullscreen()} className="ml-auto grid size-11 place-items-center rounded-full bg-white/12 backdrop-blur-md transition hover:bg-white/22" aria-label={t("watchLive.fullscreen")}><Maximize className="size-5" /></button>
        </div>
      )}

      {message && <div className="absolute inset-x-4 bottom-4 rounded-xl border border-rose-300/20 bg-black/75 px-4 py-3 text-center text-xs font-semibold text-white backdrop-blur-md" role="alert">{message}</div>}
    </div>
  );
}

export default function WatchLiveExperience({ preferredChannelId }: { preferredChannelId?: number }) {
  const { locale, t } = useTranslation();
  const { data, error, isLoading } = useWatchLiveChannels();
  const channels = useMemo(() => data?.data ?? [], [data]);
  const [selectedId, setSelectedId] = useState<number | null>(preferredChannelId ?? null);
  const selected = channels.find((channel) => channel.id === selectedId)
    ?? channels.find((channel) => channel.id === preferredChannelId)
    ?? channels.find((channel) => channel.is_live)
    ?? channels[0];
  const liveCount = channels.filter((channel) => channel.is_live).length;

  if (isLoading && channels.length === 0) {
    return <div className="watch-live-page grid min-h-[34rem] place-items-center"><div className="watch-live-muted flex items-center gap-3 text-sm font-bold"><LoaderCircle className="watch-live-accent size-5 animate-spin" /> {t("watchLive.opening")}</div></div>;
  }

  if (error || channels.length === 0 || !selected) {
    return (
      <div className="watch-live-page watch-live-empty relative grid min-h-[38rem] place-items-center overflow-hidden px-5 text-center">
        <div className="watch-live-orb watch-live-orb-one" /><div className="watch-live-orb watch-live-orb-two" />
        <div className="relative max-w-lg"><AlertCircle className="watch-live-accent mx-auto size-10" /><h1 className="mt-5 font-display text-4xl font-bold">{t("watchLive.preparing")}</h1><p className="watch-live-muted mt-3 text-sm leading-relaxed">{t("watchLive.preparingDescription")}</p><Link href="/watch" className="watch-live-primary-action mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-black"><ArrowLeft className="size-4" /> {t("watchLive.back")}</Link></div>
      </div>
    );
  }

  return (
    <div className="watch-live-page min-w-0 pb-20">
      <section className="watch-live-hero relative overflow-hidden border-b">
        <div className="watch-live-orb watch-live-orb-one" /><div className="watch-live-orb watch-live-orb-two" />
        <div className="watch-live-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-[1540px] px-4 pb-10 pt-10 sm:px-7 sm:pb-14 sm:pt-14 lg:px-10">
          <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="watch-live-accent flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]"><Sparkles className="size-4" /> {t("watchLive.fromBetar")}</p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-[.96] tracking-[-0.05em] sm:text-6xl lg:text-7xl">{t("watchLive.seeMoment")}<br /><span className="watch-live-accent">{t("watchLive.asItHappens")}</span></h1>
              <p className="watch-live-muted mt-5 max-w-2xl text-sm leading-relaxed sm:text-base">{t("watchLive.description")}</p>
            </div>
            <div className="flex flex-wrap gap-2"><span className="watch-live-chip inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold backdrop-blur"><span className={`size-2 rounded-full ${liveCount ? "animate-pulse bg-rose-500" : "watch-live-idle-dot"}`} /> {liveCount ? t("watchLive.liveCount", { count: liveCount }) : t("watchLive.channelsReady")}</span><span className="watch-live-chip inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold backdrop-blur"><ShieldCheck className="watch-live-accent size-4" /> {t("watchLive.official")}</span></div>
          </div>

          <div className="watch-live-player-shell overflow-hidden rounded-[1.1rem] border bg-black">
            <Viewer key={selected.id} channel={selected} />
            <div className="watch-live-channel-meta grid gap-5 border-t p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><div className="flex flex-wrap items-center gap-2"><span className="watch-live-accent text-[10px] font-black uppercase tracking-[0.18em]">{selected.station ?? t("brand.name")}</span>{selected.is_live && <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-rose-500"><span className="size-1.5 rounded-full bg-rose-500" /> {t("watchLive.onAir")}</span>}</div><h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{selected.session_title ?? localizedText(selected as unknown as Record<string, unknown>, "title", locale)}</h2><p className="watch-live-muted mt-2 max-w-3xl text-sm leading-relaxed">{localizedText(selected as unknown as Record<string, unknown>, "description", locale) || t("watchLive.programmeFallback")}</p></div>
              <div className="flex flex-col items-start gap-3 lg:items-end"><div className="watch-live-muted flex items-center gap-5 text-xs font-bold"><span className="inline-flex items-center gap-2"><Eye className="watch-live-accent size-4" /> {t("watchLive.watching", { count: selected.viewer_count.toLocaleString() })}</span>{selected.broadcaster && <span className="hidden sm:inline">{t("watchLive.presentedBy", { name: selected.broadcaster })}</span>}</div><ContentActions type="broadcast_channel" id={selected.id} title={selected.session_title ?? localizedText(selected as unknown as Record<string, unknown>, "title", locale)} text={localizedText(selected as unknown as Record<string, unknown>, "description", locale) || undefined} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1540px] px-4 pt-12 sm:px-7 lg:px-10">
        <div className="flex items-end justify-between gap-5"><div><p className="watch-live-accent text-xs font-black uppercase tracking-[0.18em]">{t("watchLive.allFeeds")}</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("watchLive.chooseChannel")}</h2></div><Link href="/watch" className="watch-live-muted hidden items-center gap-2 text-sm font-black transition hover:opacity-100 sm:flex"><ArrowLeft className="size-4" /> {t("watchLive.watchHome")}</Link></div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {channels.map((channel) => (
            <button key={channel.id} type="button" onClick={() => setSelectedId(channel.id)} className={`watch-live-channel-card group overflow-hidden rounded-panel border text-left transition ${channel.id === selected.id ? "is-selected" : "hover:-translate-y-0.5"}`}>
              <div className="relative aspect-[16/7] overflow-hidden bg-[#0b1619]">{channel.artwork_url ? <img src={channel.artwork_url} alt="" loading="lazy" className="size-full object-cover opacity-75 transition duration-500 group-hover:scale-[1.03]" /> : <div className="watch-live-card-fallback grid size-full place-items-center"><Radio className="watch-live-accent size-8" /></div>}<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /><span className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${channel.is_live ? "bg-rose-600 text-white" : "border border-white/15 bg-black/40 text-white/65 backdrop-blur"}`}><span className={`size-1.5 rounded-full ${channel.is_live ? "animate-pulse bg-white" : "bg-white/40"}`} /> {channel.is_live ? t("watch.liveNow") : t("watchLive.offline")}</span></div>
              <div className="p-4"><p className="watch-live-accent text-[10px] font-black uppercase tracking-[0.15em]">{channel.station ?? t("watch.portalName")}</p><h3 className="mt-1 font-display text-xl font-bold">{localizedText(channel as unknown as Record<string, unknown>, "title", locale)}</h3><p className="watch-live-muted mt-1 clamp-2 text-xs leading-relaxed">{channel.session_title ?? channel.description ?? t("watchLive.channelFallback")}</p></div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
