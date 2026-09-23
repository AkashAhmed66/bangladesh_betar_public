"use client";

import { ArrowLeft, ArrowRight, LoaderCircle, MessageSquare, Send, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import StarRating from "@/components/ui/StarRating";
import { destroy, post } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useApi } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";
import type { Comment, Paginated, PostCommentResponse } from "@/lib/types";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

interface EpisodeRating {
  avg_rating: number | null;
  rating_count: number;
  your_rating: number | null;
  distribution: Record<string, number>;
}

type EpisodeReviewsResponse = Paginated<Comment> & { rating: EpisodeRating };

/** Reviews remain scoped to the selected episode, including pagination and rating. */
export default function WatchEpisodeReviews({ episodeId, episodeTitle }: { episodeId: number; episodeTitle: string }) {
  const { locale, t } = useTranslation();
  const token = useAuth((state) => state.token);
  const { openLoginPrompt, toast } = useUi();
  const [page, setPage] = useState(1);
  const { data, error, isLoading, mutate } = useApi<EpisodeReviewsResponse>(`/watch-episodes/${episodeId}/reviews?page=${page}`);
  const [body, setBody] = useState("");
  const [draftRating, setDraftRating] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const rating = data?.rating;
  const ownRating = rating?.your_rating ?? 0;
  const selectedRating = draftRating ?? ownRating;
  const reviews = data?.data ?? [];
  const currentPage = data?.meta?.current_page ?? page;
  const lastPage = data?.meta?.last_page ?? currentPage;
  const changed = body.trim().length > 0 || (selectedRating > 0 && selectedRating !== ownRating);

  const submit = async () => {
    if (!token) {
      openLoginPrompt(t("watch.watchReviews.signIn"));
      return;
    }
    if (!changed || busy) return;
    setBusy(true);
    try {
      const response = await post<PostCommentResponse>(`/watch-episodes/${episodeId}/reviews`, {
        body: body.trim() || undefined,
        rating: selectedRating > 0 ? selectedRating : undefined,
      });
      setBody("");
      setDraftRating(null);
      toast(response.message || t("watch.watchReviews.posted"), response.data && response.data.status !== "approved" ? "info" : "success");
      if (page !== 1) setPage(1);
      await mutate();
    } catch (error) {
      toast((error as { firstError?: string }).firstError ?? t("watch.watchReviews.postFailed"), "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (deleting !== null) return;
    setDeleting(id);
    try {
      await destroy(`/comments/${id}`);
      await mutate();
      toast(t("watch.watchReviews.deleted"), "success");
    } catch {
      toast(t("watch.watchReviews.deleteFailed"), "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section className="mt-10 rounded-panel border border-edge bg-raised p-5 sm:p-8" aria-labelledby={`episode-reviews-${episodeId}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-edge pb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{episodeTitle}</p>
          <h2 id={`episode-reviews-${episodeId}`} className="mt-2 flex items-center gap-2 font-display text-2xl font-bold"><MessageSquare className="size-5 text-[var(--portal-color)]" />{t("watch.watchReviews.title")}</h2>
        </div>
      </div>

      <div className="mt-6 grid items-center gap-6 rounded-card bg-page/70 p-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:p-5" aria-label={t("watch.watchReviews.breakdown")}>
        <div className="flex flex-wrap items-center gap-3 sm:block">
          <p className="font-display text-4xl font-bold tabular-nums">{rating?.avg_rating == null ? "—" : rating.avg_rating.toLocaleString(locale === "bn" ? "bn-BD" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<span className="ml-1 text-sm font-medium text-ink-mute">/5</span></p>
          <div><StarRating value={rating?.avg_rating ?? 0} size="size-3.5" /><p className="mt-1.5 text-xs text-ink-mute">{t("comments.ratings", { count: rating?.rating_count ?? 0 })}</p></div>
        </div>
        <div className="space-y-2.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = rating?.distribution?.[String(stars)] ?? 0;
            const total = rating?.rating_count ?? 0;
            const percent = total > 0 ? Math.round(count / total * 100) : 0;
            return <div key={stars} className="flex items-center gap-3 text-xs">
              <span className="flex w-7 shrink-0 items-center gap-1 font-bold" aria-hidden="true">{stars.toLocaleString(locale === "bn" ? "bn-BD" : "en-US")}<Star className="size-3 fill-amber-400 text-amber-400" /></span>
              <div role="meter" aria-label={t("watch.watchReviews.starCount", { stars, count })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={`${percent}%`} className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-highlight">
                <div className="h-full rounded-full bg-amber-400 transition-[width] duration-300" style={{ width: `${percent}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right tabular-nums text-ink-mute">{count.toLocaleString(locale === "bn" ? "bn-BD" : "en-US")}</span>
            </div>;
          })}
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-bold">{t("watch.watchReviews.yourRating")}</label>
        <StarRating value={selectedRating} onChange={(value) => token ? setDraftRating(value) : openLoginPrompt(t("watch.watchReviews.signIn"))} size="size-6" label={t("watch.watchReviews.yourRating")} />
        <label htmlFor={`episode-review-${episodeId}`} className="mb-2 mt-4 block text-sm font-bold">{t("watch.watchReviews.yourReview")}</label>
        <textarea id={`episode-review-${episodeId}`} value={body} onChange={(event) => setBody(event.target.value)} onFocus={() => !token && openLoginPrompt(t("watch.watchReviews.signIn"))} placeholder={t("watch.watchReviews.placeholder")} rows={3} maxLength={2000} className="w-full resize-y rounded-card border border-edge bg-page px-4 py-3 text-sm leading-relaxed outline-none transition placeholder:text-ink-mute focus:border-[var(--portal-color)]" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-ink-mute">{t("watch.watchReviews.hint")}</p><button type="button" onClick={() => void submit()} disabled={busy || !changed} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--portal-color)] px-5 text-sm font-black text-[var(--portal-on-color)] transition hover:opacity-90 disabled:opacity-40">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}{t("watch.watchReviews.submit")}</button></div>
      </div>

      <div className="mt-7 space-y-4 border-t border-edge pt-6" aria-live="polite">
        {isLoading ? <p className="flex items-center gap-2 text-sm text-ink-mute"><LoaderCircle className="size-4 animate-spin" />{t("watch.watchReviews.loading")}</p> : error ? <p className="text-sm text-danger">{t("watch.watchReviews.loadFailed")}</p> : reviews.length === 0 ? <p className="text-sm text-ink-mute">{t("watch.watchReviews.empty")}</p> : reviews.map((review) => <article key={review.id} className="rounded-card bg-page/70 p-4"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold">{review.author || t("comments.listener")}</h3>{review.rating != null && <StarRating value={review.rating} size="size-3" />}<span className="text-xs text-ink-mute">{timeAgo(review.created_at, locale)}</span>{review.is_mine && <button type="button" onClick={() => void remove(review.id)} disabled={deleting !== null} aria-label={t("watch.watchReviews.delete")} className="ml-auto grid size-8 place-items-center rounded-full text-ink-mute hover:bg-danger/10 hover:text-danger disabled:opacity-40"><Trash2 className="size-4" /></button>}</div>{review.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{review.body}</p>}</article>)}
      </div>
      {lastPage > 1 && <nav aria-label={t("watch.watchReviews.pagination")} className="mt-6 flex flex-wrap items-center justify-center gap-3"><button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-edge px-4 text-sm font-bold disabled:opacity-40"><ArrowLeft className="size-4" />{t("common.previous")}</button><span className="text-sm text-ink-mute">{t("common.pageOf", { page: currentPage, pages: lastPage })}</span><button type="button" disabled={currentPage >= lastPage} onClick={() => setPage((value) => value + 1)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-edge px-4 text-sm font-bold disabled:opacity-40">{t("common.next")}<ArrowRight className="size-4" /></button></nav>}
    </section>
  );
}
