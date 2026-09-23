"use client";

import { useTranslation } from "@/lib/i18n";
import type { WatchCredit, WatchShow } from "@/lib/types";

function creditText(credits: Array<string | WatchCredit> | undefined): string {
  return (credits ?? [])
    .map((credit) => typeof credit === "string" ? credit.trim() : [credit.name, credit.role].filter(Boolean).join(" — "))
    .filter(Boolean)
    .join(" · ");
}

/** Compact programme metadata, displayed once at the foot of the hero. */
export default function WatchHeroDetails({ show }: { show: WatchShow }) {
  const { t } = useTranslation();
  const ageRating = show.age_restriction || show.age_rating || show.rating;
  const genres = Array.from(new Set((show.genres ?? []).map((genre) => genre.trim()).filter(Boolean)));
  const audioLanguages = Array.from(new Set((show.audio_languages ?? []).map((language) => language.trim()).filter(Boolean)));
  const subtitleLanguages = Array.from(new Set((show.subtitle_languages ?? []).map((language) => language.trim()).filter(Boolean)));
  const creators = creditText(show.creators);
  const cast = creditText(show.cast);
  const totalMinutes = show.episodes.reduce((total, episode) => total + episode.duration_minutes, 0);

  return (
    <div data-watch-hero-details className="mt-6 border-t border-white/15 pt-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/75">
        <span className="inline-flex items-center gap-2">
          <span>{t("watch.ageRating")}</span>
          <span className="rounded border border-white/25 px-2 py-0.5 font-bold text-white">{ageRating || t("common.notRated")}</span>
        </span>
        {show.year && <span aria-label={t("watch.releaseYear")}>{show.year}</span>}
        <span>{t("common.episodes", { count: show.episodes.length })}</span>
        {totalMinutes > 0 && <span aria-label={t("watch.totalRuntime")}>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</span>}
      </div>
      {genres.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={t("watch.genres")}>
          {genres.map((genre) => <li key={genre} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85">{genre}</li>)}
        </ul>
      )}
      {(audioLanguages.length > 0 || subtitleLanguages.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/80">
          {audioLanguages.length > 0 && <span><span className="font-semibold text-white/55">{t("watch.audioLanguages")}:</span> {audioLanguages.join(", ")}</span>}
          {subtitleLanguages.length > 0 && <span><span className="font-semibold text-white/55">{t("watch.subtitleLanguages")}:</span> {subtitleLanguages.join(", ")}</span>}
        </div>
      )}
      {(creators || cast) && (
        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs leading-relaxed sm:text-sm">
          {creators && <><dt className="font-semibold text-white/55">{t("watch.creators")}</dt><dd className="min-w-0 break-words text-white/90">{creators}</dd></>}
          {cast && <><dt className="font-semibold text-white/55">{t("watch.cast")}</dt><dd className="min-w-0 break-words text-white/90">{cast}</dd></>}
        </dl>
      )}
    </div>
  );
}
