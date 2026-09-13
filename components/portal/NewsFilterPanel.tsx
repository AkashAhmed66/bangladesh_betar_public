"use client";

/* eslint-disable @next/next/no-img-element */
import { Clock3, LoaderCircle, Newspaper, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useNewsArticles, usePortalCategories } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";

type FilterState = { query: string; category: string; sort: "latest" | "popular" };
const EMPTY_FILTER: FilterState = { query: "", category: "", sort: "latest" };

export default function NewsFilterPanel({ showHeader = true }: { showHeader?: boolean }) {
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
    <section className="news-discovery border-y border-edge bg-page" aria-labelledby="news-discovery-title">
      <div className="mx-auto w-full max-w-[1540px] px-4 py-12 sm:px-7 sm:py-14 lg:px-10 lg:py-16">
        {showHeader && <header className="border-t-[3px] border-ink pt-3">
          <p className="font-display text-sm font-black uppercase tracking-[0.04em] text-[var(--portal-color)]">
            {t("news.findNewsEyebrow")}
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)] lg:items-end lg:gap-12">
            <h2 id="news-discovery-title" className="font-bangla text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
              {t("news.findNews")}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-ink-soft lg:justify-self-end">
              {t("news.findNewsDescription")}
            </p>
          </div>
        </header>}

        <form onSubmit={apply} className={`${showHeader ? "mt-8" : ""} grid items-end gap-4 border-y border-edge py-6 md:grid-cols-2 xl:grid-cols-[minmax(17rem,2fr)_minmax(12rem,1fr)_minmax(11rem,0.8fr)_auto_auto]`}>
          <label className="block min-w-0">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-ink-mute">
              {t("news.searchPlaceholder")}
            </span>
            <span className="flex min-h-12 items-center gap-3 border border-edge-strong bg-elev px-4 transition focus-within:border-[var(--portal-color)] focus-within:ring-1 focus-within:ring-[var(--portal-color)]">
              <Search className="size-5 shrink-0 text-ink-mute" aria-hidden="true" />
              <input
                value={fields.query}
                onChange={(event) => setFields((current) => ({ ...current, query: event.target.value }))}
                className="min-w-0 flex-1 bg-transparent font-bangla text-sm font-semibold outline-none placeholder:text-ink-mute"
                placeholder={t("news.searchPlaceholder")}
              />
            </span>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-ink-mute">
              {t("news.filterCategory")}
            </span>
            <select
              value={fields.category}
              onChange={(event) => setFields((current) => ({ ...current, category: event.target.value }))}
              className="min-h-12 w-full border border-edge-strong bg-elev px-4 font-bangla text-sm font-bold text-ink outline-none transition focus:border-[var(--portal-color)] focus:ring-1 focus:ring-[var(--portal-color)]"
            >
              <option value="">{t("news.allCategories")}</option>
              {categories.map((category) => (
                <optgroup key={category.id} label={localizedText(category as unknown as Record<string, unknown>, "label", locale)}>
                  <option value={category.slug}>{t("news.allSection", { category: localizedText(category as unknown as Record<string, unknown>, "label", locale) })}</option>
                  {(category.subcategories ?? []).map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.slug}>
                      {localizedText(subcategory as unknown as Record<string, unknown>, "label", locale)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-ink-mute">
              {t("news.filterSort")}
            </span>
            <select
              value={fields.sort}
              onChange={(event) => setFields((current) => ({ ...current, sort: event.target.value as FilterState["sort"] }))}
              className="min-h-12 w-full border border-edge-strong bg-elev px-4 font-bangla text-sm font-bold text-ink outline-none transition focus:border-[var(--portal-color)] focus:ring-1 focus:ring-[var(--portal-color)]"
            >
              <option value="latest">{t("news.latestFirst")}</option>
              <option value="popular">{t("news.mostReadFirst")}</option>
            </select>
          </label>

          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[var(--portal-color)] px-6 text-sm font-black text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--portal-color)]">
            <Search className="size-4.5" aria-hidden="true" />
            {t("news.applyFilters")}
          </button>
          <button type="button" onClick={reset} className="inline-flex min-h-12 items-center justify-center gap-2 border border-edge-strong bg-elev px-4 text-sm font-black text-ink-soft transition hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--portal-color)]" aria-label={t("news.resetFilters")}>
            <RotateCcw className="size-4.5" aria-hidden="true" />
            <span className="xl:sr-only">{t("news.resetFilters")}</span>
          </button>
        </form>

        <div className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3 border-t-[3px] border-ink pt-3">
            <h3 className="font-display text-lg font-black uppercase tracking-[0.02em]">{t("news.filteredResults")}</h3>
            <p className="text-xs font-bold text-ink-mute">{t("news.resultsCount", { count: data?.meta?.total ?? stories.length })}</p>
          </div>

          {isLoading ? (
            <div className="grid min-h-64 place-items-center">
              <LoaderCircle className="size-6 animate-spin text-[var(--portal-color)]" />
            </div>
          ) : stories.length === 0 ? (
            <div className="grid min-h-64 place-items-center border-b border-edge text-center">
              <div>
                <Newspaper className="mx-auto size-8 text-ink-mute" />
                <p className="mt-3 font-bold">{t("news.noSearchResults")}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
              {stories.map((story) => (
                <article key={story.id} className="group min-w-0 border-b border-edge pb-5">
                  <Link href={`/news/${story.slug}`} className="block">
                    <span className="relative block aspect-[16/10] overflow-hidden bg-sunken">
                      {story.image_url ? (
                        <img src={story.image_url} alt="" className="size-full object-cover transition duration-500 group-hover:scale-[1.025]" />
                      ) : (
                        <span className="grid size-full place-items-center"><Newspaper className="size-6 text-ink-mute" /></span>
                      )}
                    </span>
                    <span className="mt-3 block text-[10px] font-black uppercase tracking-[0.13em] text-[var(--portal-color)]">
                      {localizedText(story as unknown as Record<string, unknown>, "category", locale)}
                    </span>
                    <h4 className="mt-1.5 clamp-3 font-bangla text-lg font-bold leading-[1.18] group-hover:underline">
                      {localizedText(story as unknown as Record<string, unknown>, "title", locale)}
                    </h4>
                    <p className="mt-2 clamp-2 font-bangla text-sm leading-5 text-ink-soft">
                      {localizedText(story as unknown as Record<string, unknown>, "summary", locale)}
                    </p>
                    <span className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-ink-mute">
                      <Clock3 className="size-3.5" aria-hidden="true" />
                      {story.published}
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
