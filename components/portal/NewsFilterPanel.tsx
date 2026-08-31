"use client";

/* eslint-disable @next/next/no-img-element */
import { LoaderCircle, Newspaper, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useNewsArticles, usePortalCategories } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";

type FilterState = { query: string; category: string; sort: "latest" | "popular" };
const EMPTY_FILTER: FilterState = { query: "", category: "", sort: "latest" };

export default function NewsFilterPanel() {
  const { locale, t } = useTranslation();
  const [fields, setFields] = useState<FilterState>(EMPTY_FILTER);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER);
  const { data: categoriesResponse } = usePortalCategories();
  const { data, isLoading } = useNewsArticles({
    search: filters.query,
    category: filters.category || undefined,
    sort: filters.sort,
    perPage: 8,
  });
  const stories = data?.data ?? [];
  const categories = categoriesResponse?.data.news ?? [];

  const apply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters({ ...fields, query: fields.query.trim() });
  };

  const reset = () => {
    setFields(EMPTY_FILTER);
    setFilters(EMPTY_FILTER);
  };

  return (
    <section className="news-discovery border-y border-edge bg-raised" aria-labelledby="news-discovery-title">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-10 sm:px-7 lg:px-10">
        <div className="grid gap-7 xl:grid-cols-[20rem_1fr] xl:gap-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.17em] text-[var(--portal-color)]">{t("news.findNewsEyebrow")}</p>
            <h2 id="news-discovery-title" className="mt-2 font-display text-3xl font-bold tracking-tight">{t("news.findNews")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("news.findNewsDescription")}</p>

            <form onSubmit={apply} className="mt-6 space-y-3">
              <label className="block">
                <span className="sr-only">{t("news.searchPlaceholder")}</span>
                <span className="flex min-h-12 items-center gap-2 rounded-card border border-edge bg-elev px-3 focus-within:border-[var(--portal-color)]">
                  <Search className="size-4.5 text-ink-mute" />
                  <input value={fields.query} onChange={(event) => setFields((current) => ({ ...current, query: event.target.value }))} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-ink-mute" placeholder={t("news.searchPlaceholder")} />
                </span>
              </label>
              <select value={fields.category} onChange={(event) => setFields((current) => ({ ...current, category: event.target.value }))} className="min-h-12 w-full rounded-card border border-edge bg-elev px-3 text-sm font-bold text-ink outline-none focus:border-[var(--portal-color)]" aria-label={t("news.filterCategory")}>
                <option value="">{t("news.allCategories")}</option>
                {categories.map((category) => (
                  <optgroup key={category.id} label={localizedText(category as unknown as Record<string, unknown>, "label", locale)}>
                    <option value={category.slug}>{t("news.allSection", { category: localizedText(category as unknown as Record<string, unknown>, "label", locale) })}</option>
                    {(category.subcategories ?? []).map((subcategory) => <option key={subcategory.id} value={subcategory.slug}>{localizedText(subcategory as unknown as Record<string, unknown>, "label", locale)}</option>)}
                  </optgroup>
                ))}
              </select>
              <select value={fields.sort} onChange={(event) => setFields((current) => ({ ...current, sort: event.target.value as FilterState["sort"] }))} className="min-h-12 w-full rounded-card border border-edge bg-elev px-3 text-sm font-bold text-ink outline-none focus:border-[var(--portal-color)]" aria-label={t("news.filterSort")}>
                <option value="latest">{t("news.latestFirst")}</option>
                <option value="popular">{t("news.mostReadFirst")}</option>
              </select>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card bg-[var(--portal-color)] px-5 text-sm font-black text-white transition hover:brightness-110"><Search className="size-4.5" /> {t("news.applyFilters")}</button>
                <button type="button" onClick={reset} className="grid size-12 place-items-center rounded-card border border-edge text-ink-mute transition hover:bg-highlight hover:text-ink" aria-label={t("news.resetFilters")}><RotateCcw className="size-4.5" /></button>
              </div>
            </form>
          </div>

          <div className="min-w-0 border-t border-edge pt-7 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-[0.14em] text-ink-mute">{t("news.filteredResults")}</p><p className="mt-1 text-sm text-ink-soft">{t("news.resultsCount", { count: data?.meta?.total ?? stories.length })}</p></div>
            </div>
            {isLoading ? (
              <div className="grid min-h-64 place-items-center"><LoaderCircle className="size-6 animate-spin text-[var(--portal-color)]" /></div>
            ) : stories.length === 0 ? (
              <div className="grid min-h-64 place-items-center text-center"><div><Newspaper className="mx-auto size-8 text-ink-mute" /><p className="mt-3 font-bold">{t("news.noSearchResults")}</p></div></div>
            ) : (
              <div className="mt-5 grid gap-x-6 gap-y-6 sm:grid-cols-2">
                {stories.map((story) => (
                  <Link key={story.id} href={`/news/${story.slug}`} className="group grid grid-cols-[7rem_1fr] gap-3 border-t border-edge pt-4">
                    <span className="aspect-[4/3] overflow-hidden rounded-card bg-sunken">{story.image_url ? <img src={story.image_url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <span className="grid size-full place-items-center"><Newspaper className="size-5 text-ink-mute" /></span>}</span>
                    <span className="min-w-0"><span className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</span><span className="clamp-3 mt-1 block font-bangla text-base font-bold leading-snug group-hover:underline">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</span></span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
