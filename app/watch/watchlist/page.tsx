"use client";

/* eslint-disable @next/next/no-img-element */
import { ArrowLeft, Bookmark, Film, LoaderCircle, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { destroy } from "@/lib/api";
import { localizedText, useTranslation } from "@/lib/i18n";
import { useWatchlist, type WatchlistEntry } from "@/lib/watchlist";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

export default function WatchlistPage() {
  const { t, locale } = useTranslation();
  const token = useAuth((state) => state.token);
  const hydrated = useAuth((state) => state.hydrated);
  const openLoginPrompt = useUi((state) => state.openLoginPrompt);
  const toast = useUi((state) => state.toast);
  const { data, error, isLoading, mutate } = useWatchlist();
  const { mutate: refresh } = useSWRConfig();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [removing, setRemoving] = useState<number | null>(null);
  const entries = (data?.data ?? []).filter((entry) => {
    const text = [entry.item.title, entry.item.title_bn, entry.watchable_type === "watch_episode" ? entry.item.show.title : ""].join(" ").toLocaleLowerCase();
    return (filter === "all" || filter === entry.watchable_type) && text.includes(query.trim().toLocaleLowerCase());
  });

  const remove = async (entry: WatchlistEntry) => {
    if (removing !== null) return;
    setRemoving(entry.id);
    try {
      await destroy(`/me/watchlist/${entry.watchable_type}/${entry.watchable_id}`);
      await mutate((current) => current && ({ data: current.data.filter((item) => item.id !== entry.id) }), { revalidate: false });
      void refresh((key) => Array.isArray(key) && String(key[0]).startsWith("/watch"));
      toast(t("watch.removedFromWatchlist"), "success");
    } catch { toast(t("watch.watchlistFailed"), "error"); }
    finally { setRemoving(null); }
  };

  return (
    <div className="mx-auto max-w-[1540px] px-4 py-10 sm:px-7 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-edge pb-8"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--portal-color)]">{t("watch.portalName")}</p><h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{t("watch.myWatchlist")}</h1><p className="mt-3 text-sm text-ink-soft">{t("watch.watchlistDescription")}</p></div><Link href="/watch" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edge px-5 text-sm font-bold hover:bg-highlight"><ArrowLeft className="size-4" />{t("watch.backToWatch")}</Link></div>
      {!hydrated || (token && isLoading) ? <div className="grid min-h-64 place-items-center"><LoaderCircle className="size-7 animate-spin text-[var(--portal-color)]" /></div> : !token ? <div className="mx-auto max-w-md py-20 text-center"><Bookmark className="mx-auto size-10 text-[var(--portal-color)]" /><h2 className="mt-5 font-display text-2xl font-bold">{t("watch.signInToWatchlist")}</h2><button type="button" onClick={() => openLoginPrompt(t("watch.signInToWatchlist"))} className="mt-6 min-h-11 rounded-full bg-[var(--portal-color)] px-6 text-sm font-bold text-[var(--portal-on-color)]">{t("auth.signIn")}</button></div> : error ? <div className="py-20 text-center"><p>{t("watch.watchlistFailed")}</p><button type="button" onClick={() => void mutate()} className="mt-4 rounded-full border border-edge px-5 py-2 font-bold">{t("watch.retry")}</button></div> : <>
        <div className="my-8 flex flex-col gap-3 rounded-panel border border-edge bg-raised p-4 sm:flex-row"><label className="relative flex-1"><span className="sr-only">{t("watch.searchWatchlist")}</span><Search className="absolute left-4 top-3.5 size-4 text-ink-mute" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("watch.searchWatchlist")} className="min-h-11 w-full rounded-full border border-edge bg-page pl-11 pr-4 text-sm outline-none focus:border-[var(--portal-color)]" /></label><label><span className="sr-only">{t("watch.watchlistFilter")}</span><select value={filter} onChange={(event) => setFilter(event.target.value)} className="min-h-11 w-full rounded-full border border-edge bg-page px-5 text-sm sm:w-52"><option value="all">{t("watch.allSavedItems")}</option><option value="watch_show">{t("watch.savedShows")}</option><option value="watch_episode">{t("watch.episodesLabel")}</option></select></label></div>
        {entries.length === 0 ? <div className="rounded-panel border border-dashed border-edge bg-raised px-6 py-16 text-center"><Bookmark className="mx-auto size-10 text-ink-mute" /><h2 className="mt-4 font-display text-2xl font-bold">{t(data?.data.length ? "watch.noWatchlistMatches" : "watch.watchlistEmpty")}</h2><p className="mt-2 text-sm text-ink-soft">{t("watch.watchlistEmptyDescription")}</p></div> : <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),340px))] gap-6">{entries.map((entry) => { const show = entry.watchable_type === "watch_episode" ? entry.item.show : entry.item; const title = localizedText(entry.item as unknown as Record<string, unknown>, "title", locale); const href = `/watch/${show.slug}${entry.watchable_type === "watch_episode" ? `?episode=${entry.item.id}#watch-player` : ""}`; return <article key={entry.id} className="overflow-hidden rounded-panel border border-edge bg-raised"><Link href={href} className="group block"><div className="aspect-video overflow-hidden bg-sunken">{show.image_url ? <img src={show.image_url} alt="" className="size-full object-cover transition group-hover:scale-105" /> : <div className="grid size-full place-items-center"><Film className="size-10 text-ink-mute" /></div>}</div><div className="p-4"><p className="text-[10px] font-black uppercase tracking-wider text-[var(--portal-color)]">{entry.watchable_type === "watch_episode" ? t("watch.episode", { number: entry.item.position }) : t("watch.savedShows")}</p><h2 className="mt-1 font-display text-lg font-bold group-hover:underline">{title}</h2>{entry.watchable_type === "watch_episode" && <p className="mt-1 text-xs text-ink-mute">{localizedText(show as unknown as Record<string, unknown>, "title", locale)}</p>}</div></Link><div className="border-t border-edge px-4 py-3"><button type="button" disabled={removing !== null} onClick={() => void remove(entry)} className="inline-flex min-h-9 items-center gap-2 text-xs font-bold text-ink-soft hover:text-danger disabled:opacity-50">{removing === entry.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}{t("watch.removeFromWatchlist")}</button></div></article>; })}</div>}
      </>}
    </div>
  );
}
