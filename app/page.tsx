"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Headphones, Play, Radio, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SectionRow from "@/components/cards/SectionRow";
import Artwork from "@/components/ui/Artwork";
import { PlayCircle, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { BRAND } from "@/config/theme";
import { displayTitle, formatDuration, itemHref } from "@/lib/format";
import { useContinueListening, useForYou, useHome, useLiveChannels } from "@/lib/hooks";
import { playItem } from "@/lib/play";
import { toTrack } from "@/lib/tracks";
import type { Artist, AudioAsset, CatalogueItem } from "@/lib/types";
import { useAuth } from "@/stores/auth";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

function itemArtwork(item: CatalogueItem | undefined): string | null {
  if (!item) return null;
  if ("artwork_url" in item) return item.artwork_url;
  if (item.type === "artist") return (item as Artist).photo_url;
  return null;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Late night listening";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const { data: home, isLoading } = useHome();
  const { data: live } = useLiveChannels();
  const { data: forYou } = useForYou();
  const { data: continueListening } = useContinueListening();
  const user = useAuth((state) => state.user);
  const locale = useUi((state) => state.locale);
  const playTrack = usePlayer((state) => state.playTrack);
  const [slide, setSlide] = useState(0);

  const banners = useMemo(() => home?.banners ?? [], [home]);
  const featuredItems = useMemo(
    () => (home?.sections ?? []).flatMap((section) => section.items).slice(0, 8),
    [home],
  );
  const slideCount = Math.max(banners.length, featuredItems.length);
  const activeSlide = slideCount ? slide % slideCount : 0;
  const banner = banners[activeSlide] ?? banners[0];
  const heroItem = featuredItems[activeSlide % Math.max(1, featuredItems.length)] ?? featuredItems[0];
  const heroTitle = banner
    ? (locale === "bn" && banner.title_bn ? banner.title_bn : banner.title)
    : heroItem
      ? displayTitle(heroItem, locale)
      : "The sound of Bangladesh, all in one place";
  const heroSubtitle = banner?.subtitle ?? "Live radio, unforgettable songs, landmark programmes and voices from the national archive.";

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % slideCount), 7000);
    return () => window.clearInterval(timer);
  }, [slideCount]);

  const resumeItems = useMemo(
    () => (continueListening?.data ?? []).filter((entry) => entry.asset),
    [continueListening],
  );

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      {isLoading ? (
        <Skeleton className="portal-full-bleed -mt-5 h-[32rem] rounded-none sm:-mt-7" />
      ) : (
        <section className="portal-full-bleed relative -mt-5 overflow-hidden border-b border-edge bg-raised sm:-mt-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,color-mix(in_srgb,var(--portal-color)_18%,transparent),transparent_48%),linear-gradient(115deg,var(--bg-raised),var(--bg-elev))]" />
          {itemArtwork(heroItem) && (
            <div className="absolute inset-y-0 right-0 hidden w-1/2 opacity-25 blur-3xl lg:block" style={{ backgroundImage: `url(${itemArtwork(heroItem)})`, backgroundSize: "cover" }} />
          )}
          <div className="relative mx-auto grid min-h-[31rem] max-w-[1320px] items-center gap-8 px-5 py-10 sm:px-10 lg:grid-cols-[24rem_1fr] lg:gap-14 lg:py-14">
            <div className="mx-auto w-full max-w-[21rem] lg:max-w-none">
              <Artwork
                type={heroItem?.type ?? "audio_asset"}
                id={heroItem?.id ?? 0}
                url={banner?.image_url ?? itemArtwork(heroItem)}
                title={heroTitle}
                className="aspect-square w-full rounded-panel shadow-2xl shadow-shade/35 ring-1 ring-white/10"
              />
            </div>
            <div className="min-w-0 max-w-3xl">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--portal-color)]"><Sparkles className="size-4" /> Featured on {BRAND.shortName}</p>
              <h1 className="mt-4 break-words font-display text-4xl font-bold leading-[1.04] tracking-[-0.05em] sm:text-6xl">{heroTitle}</h1>
              {heroItem && <p className="mt-3 text-sm font-bold text-ink-soft">{displayTitle(heroItem, locale)}</p>}
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">{heroSubtitle}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {heroItem && (
                  <button type="button" onClick={() => void playItem(heroItem)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--portal-color)] px-6 text-sm font-black text-white transition hover:scale-[1.02]"><Play className="size-4 fill-current" /> Listen now</button>
                )}
                <Link href={heroItem ? itemHref(heroItem) : banner?.target_value || "/browse"} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-edge-strong bg-elev/50 px-6 text-sm font-black backdrop-blur transition hover:bg-highlight">More info <ArrowRight className="size-4" /></Link>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex max-w-[1320px] items-center gap-3 px-5 pb-7 sm:px-10">
            <button type="button" onClick={() => setSlide((value) => (value - 1 + slideCount) % Math.max(1, slideCount))} className="grid size-11 shrink-0 place-items-center rounded-full border border-edge bg-elev/70 text-ink-soft backdrop-blur" aria-label="Previous feature"><ChevronLeft className="size-5" /></button>
            <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(featuredItems.length ? featuredItems : [heroItem]).filter(Boolean).slice(0, 6).map((item, index) => {
                const value = item as CatalogueItem;
                return (
                  <button type="button" key={`${value.type}-${value.id}`} onClick={() => setSlide(index)} className={`flex min-w-52 items-center gap-3 border-t-4 px-2 pt-3 text-left transition ${index === activeSlide ? "border-[var(--portal-color)]" : "border-edge opacity-65 hover:opacity-100"}`}>
                    <Artwork type={value.type} id={value.id} url={itemArtwork(value)} title={displayTitle(value, locale)} className="size-14 shrink-0 rounded-card" />
                    <span className="clamp-2 text-xs font-bold leading-snug">{displayTitle(value, locale)}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setSlide((value) => (value + 1) % Math.max(1, slideCount))} className="grid size-11 shrink-0 place-items-center rounded-full border border-edge bg-elev/70 text-ink-soft backdrop-blur" aria-label="Next feature"><ChevronRight className="size-5" /></button>
          </div>
        </section>
      )}

      {(live?.data.length ?? 0) > 0 && (
        <section>
          <SectionHeading title={<span className="editorial-rule">Live radio · now streaming</span>} action={<Link href="/live" className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-ink-mute hover:text-ink">All stations <ArrowRight className="size-3.5" /></Link>} />
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-7 sm:px-7 [&::-webkit-scrollbar]:hidden">
            {live!.data.map((channel) => (
              <Link href={`/live/${channel.id}`} key={channel.id} className="group flex w-72 shrink-0 items-center gap-4 rounded-panel border border-edge bg-raised p-4 transition hover:-translate-y-0.5 hover:border-edge-strong">
                <div className="relative">
                  <Artwork type="live_channel" id={channel.id} url={channel.artwork_url} title={channel.title} className="size-20 shrink-0 rounded-full" rounded="rounded-full" />
                  <span className={`absolute bottom-0 right-0 size-4 rounded-full ring-4 ring-raised ${channel.is_live ? "bg-danger" : "bg-ink-mute"}`} />
                </div>
                <div className="min-w-0">
                  <p className="clamp-1 font-display text-base font-bold">{locale === "bn" && channel.title_bn ? channel.title_bn : channel.title}</p>
                  <p className="mt-1 clamp-1 text-xs text-ink-mute">{channel.is_live ? channel.session_title || "Live now" : "Currently offline"}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[var(--portal-color)]"><Radio className="size-3.5" /> Open station</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {resumeItems.length > 0 && (
        <section>
          <SectionHeading title={<span className="editorial-rule">{greeting()}{user ? `, ${user.name.split(" ")[0]}` : ""}</span>} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {resumeItems.slice(0, 6).map(({ asset, progress_seconds }) => {
              const recording = asset as AudioAsset;
              const track = toTrack(recording);
              const percent = recording.duration_seconds ? Math.min(100, (progress_seconds / recording.duration_seconds) * 100) : 0;
              return (
                <div key={recording.id} className="group relative flex items-center gap-3 overflow-hidden rounded-card border border-edge bg-raised transition hover:border-edge-strong hover:bg-highlight">
                  <Artwork type="audio_asset" id={recording.id} url={recording.artwork_url} title={recording.title} className="size-18 shrink-0 rounded-none" />
                  <div className="min-w-0 flex-1 py-2 pr-2">
                    <Link href={`/assets/${recording.id}`} className="clamp-1 text-sm font-bold hover:underline">{displayTitle(recording, locale)}</Link>
                    <p className="mt-1 text-xs text-ink-mute">{formatDuration(progress_seconds)} / {formatDuration(recording.duration_seconds)} · resume</p>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-sunken"><div className="h-full rounded-full bg-[var(--portal-color)]" style={{ width: `${percent}%` }} /></div>
                  </div>
                  {track && <div className="pr-3"><PlayCircle size="size-10" icon="size-4" onClick={() => playTrack(track, progress_seconds)} label={`Resume ${recording.title}`} /></div>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {forYou && forYou.data.length > 0 && (
        <SectionRow title={<span className="editorial-rule flex items-center gap-2">{forYou.personalized ? "Made for you" : "Popular right now"}{forYou.personalized && <Sparkles className="size-4 text-[var(--portal-color)]" />}</span>} items={forYou.data} />
      )}

      {isLoading && <><SectionRow title="Loading" loading /><SectionRow title="Loading" loading /></>}
      {home?.sections.map((section) => (
        <SectionRow key={section.id} title={<span className="editorial-rule">{locale === "bn" && section.title_bn ? section.title_bn : section.title}</span>} items={section.items} />
      ))}

      <section className="portal-tint-panel overflow-hidden rounded-panel">
        <div className="grid gap-6 p-7 sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="portal-tint-eyebrow flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em]"><Headphones className="size-4" /> One account, every Betar service</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Carry the stories with you.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">Your account, language and appearance preference now travel across News, Watch and Listen.</p>
          </div>
          <Link href={user ? "/account" : "/login"} className="portal-tint-action inline-flex min-h-12 w-fit items-center gap-2 rounded-full px-6 text-sm font-black transition">{user ? "Open account" : "Log in"} <ArrowRight className="size-4" /></Link>
        </div>
      </section>
    </div>
  );
}
