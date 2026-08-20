"use client";

/* eslint-disable @next/next/no-img-element */
import { ArrowRight, CirclePlay, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { usePortalCategories, useWatchShows } from "@/lib/hooks";

const COLORS = ["#973e62", "#227f79", "#a56625", "#3f6eb5", "#6552a5"];

export default function WatchCategoriesPage() {
  const { data: categoryResponse, isLoading: categoriesLoading } = usePortalCategories();
  const { data: showResponse } = useWatchShows({ perPage: 50 });
  const categories = categoryResponse?.data.watch ?? [];
  const shows = showResponse?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-[1540px] px-4 pb-20 pt-8 sm:px-7 sm:pt-12 lg:px-10">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--portal-color)]">Betar Watch</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Browse categories</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">Explore every published programme by the category selected in the admin portal.</p>
      </div>

      {categoriesLoading ? (
        <div className="grid min-h-[24rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /> Loading categories…</div></div>
      ) : (
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const matching = shows.filter((show) => show.category === category.value);
            const image = matching.find((show) => show.image_url)?.image_url;
            const href = category.slug === "live-tv" ? "/watch/live" : `/watch/category/${category.slug}`;
            return (
              <Link key={category.slug} href={href} className="group relative min-h-60 overflow-hidden rounded-panel p-6 text-white" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                {image && <img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-35 transition duration-500 group-hover:scale-105 group-hover:opacity-45" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="relative flex h-full min-h-48 flex-col justify-end">
                  <CirclePlay className="size-8" />
                  <h2 className="mt-4 font-display text-3xl font-bold">{category.label}</h2>
                  <div className="mt-2 flex items-center justify-between text-sm font-bold text-white/75"><span>{matching.length} {matching.length === 1 ? "show" : "shows"}</span><span className="inline-flex items-center gap-1 transition group-hover:gap-2">Explore <ArrowRight className="size-4" /></span></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
