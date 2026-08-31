"use client";

/* eslint-disable @next/next/no-img-element */
import { ChevronLeft, ChevronRight, CirclePlay, Info, Sparkles, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { WatchShow } from "@/lib/types";

interface WatchHeroSliderProps {
  shows: WatchShow[];
}

export default function WatchHeroSlider({ shows }: WatchHeroSliderProps) {
  const { locale, t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const heroShows = shows.length > 0 ? shows.slice(0, 6) : [];
  const currentShow = heroShows[activeIndex] ?? heroShows[0];

  const nextSlide = useCallback(() => {
    if (heroShows.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % heroShows.length);
  }, [heroShows.length]);

  const prevSlide = useCallback(() => {
    if (heroShows.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + heroShows.length) % heroShows.length);
  }, [heroShows.length]);

  // Auto-slide effect
  useEffect(() => {
    if (heroShows.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [heroShows.length, isPaused, nextSlide]);

  if (!currentShow) return null;

  const title = localizedText(currentShow as unknown as Record<string, unknown>, "title", locale);
  const description = localizedText(currentShow as unknown as Record<string, unknown>, "description", locale);
  const category = localizedText(currentShow as unknown as Record<string, unknown>, "category", locale);
  const eyebrow = localizedText(currentShow as unknown as Record<string, unknown>, "eyebrow", locale) || category;

  return (
    <section
      ref={sliderRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[480px] w-full overflow-hidden bg-black text-white sm:min-h-[560px] lg:min-h-[640px]"
      aria-roledescription="carousel"
      aria-label="Featured Shows Carousel"
    >
      {/* Background Images with Crossfade */}
      {heroShows.map((show, index) => {
        const isCurrent = index === activeIndex;
        return (
          <div
            key={show.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            {show.image_url ? (
              <img
                src={show.image_url}
                alt=""
                className="size-full object-cover object-center transform scale-105 transition-transform duration-10000"
              />
            ) : (
              <div className="size-full bg-gradient-to-br from-zinc-900 via-neutral-900 to-black" />
            )}
          </div>
        );
      })}

      {/* Cinematic Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto flex min-h-[480px] max-w-[1540px] flex-col justify-end px-4 pb-14 pt-20 sm:min-h-[560px] sm:px-7 sm:pb-16 lg:min-h-[640px] lg:px-10 lg:pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow & Live/Exclusive Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--portal-color,#e50914)] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white shadow-md">
              <Sparkles className="size-3.5" /> {eyebrow}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
              {currentShow.year ?? "2026"} · {currentShow.rating ?? "PG"}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
              {t("common.episodes", { count: currentShow.episodes_count ?? currentShow.episodes.length })}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
            {title}
          </h1>

          {/* Description */}
          <p className="mt-3 clamp-3 max-w-2xl text-sm leading-relaxed text-zinc-200 sm:text-base sm:leading-relaxed lg:text-lg">
            {description}
          </p>

          {/* Call to Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
            <Link
              href={`/watch/${currentShow.slug}`}
              className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[var(--portal-color,#e50914)] px-7 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:scale-[1.03] hover:brightness-110 active:scale-95"
            >
              <CirclePlay className="size-5" />
              {t("watch.playNow", { defaultValue: "Watch Now" })}
            </Link>
            <Link
              href={`/watch/${currentShow.slug}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-black/40 px-6 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <Info className="size-4.5" />
              {t("watch.moreInfo", { defaultValue: "More Details" })}
            </Link>
          </div>
        </div>

        {/* Carousel Controls & Pagination Dots */}
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 sm:mt-10">
          {/* Slide Indicator Dots / Progress Bars */}
          <div className="flex items-center gap-2">
            {heroShows.map((show, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={show.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`relative h-2 rounded-full transition-all duration-300 ${
                    isActive ? "w-8 bg-[var(--portal-color,#e50914)]" : "w-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>

          {/* Manual Prev / Next Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="grid size-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:border-white/50 hover:bg-white/20 active:scale-90"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next Slide"
              className="grid size-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:border-white/50 hover:bg-white/20 active:scale-90"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
