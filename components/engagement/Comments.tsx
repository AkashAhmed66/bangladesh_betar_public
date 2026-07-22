"use client";

import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import StarRating from "@/components/ui/StarRating";
import { destroy, post } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useComments } from "@/lib/hooks";
import type { Comment, PostCommentResponse } from "@/lib/types";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

interface CommentsProps {
  assetId: number;
  allowComments?: boolean;
  avgRating?: number | null;
  ratingCount?: number;
  /** The signed-in listener's own existing rating, if any (pre-fills the picker). */
  myRating?: number | null;
  /** Called after a rating changes so the caller can revalidate the asset. */
  onRatingChange?: (agg: { avg_rating: number; rating_count: number; your_rating: number }) => void;
}

/**
 * Unified Comments & Ratings panel — a listener can post a comment, leave a
 * star rating, or both together in one submission. Each comment in the feed
 * shows the rating its author gave (if any) alongside their words.
 */
export default function Comments({
  assetId,
  allowComments = true,
  avgRating: avgRatingProp,
  ratingCount: ratingCountProp = 0,
  myRating: myRatingProp,
  onRatingChange,
}: CommentsProps) {
  const { data, mutate, isLoading } = useComments(assetId);
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const { openLoginPrompt, toast } = useUi();

  const [body, setBody] = useState("");
  const [committedRating, setCommittedRating] = useState(myRatingProp ?? 0);
  const [pendingRating, setPendingRating] = useState(myRatingProp ?? 0);
  const [avgRating, setAvgRating] = useState(avgRatingProp ?? null);
  const [ratingCount, setRatingCount] = useState(ratingCountProp);
  const [busy, setBusy] = useState(false);

  // The asset (and its avg_rating / my_rating) is fetched by the parent and
  // may resolve after this component mounts — sync local state whenever the
  // upstream values change (e.g. once loaded, or when navigating to a
  // different asset), without clobbering the listener's in-progress edits.
  const [syncKey, setSyncKey] = useState({ avgRatingProp, ratingCountProp, myRatingProp });
  if (
    syncKey.avgRatingProp !== avgRatingProp ||
    syncKey.ratingCountProp !== ratingCountProp ||
    syncKey.myRatingProp !== myRatingProp
  ) {
    setSyncKey({ avgRatingProp, ratingCountProp, myRatingProp });
    setAvgRating(avgRatingProp ?? null);
    setRatingCount(ratingCountProp ?? 0);
    setCommittedRating(myRatingProp ?? 0);
    setPendingRating(myRatingProp ?? 0);
  }

  const comments = data?.data ?? [];
  const hasChanges = body.trim() !== "" || pendingRating !== committedRating;

  const submit = async () => {
    if (!hasChanges || busy) return;
    if (!token) {
      openLoginPrompt("Sign in to comment or rate this recording.");
      return;
    }
    setBusy(true);
    try {
      const res = await post<PostCommentResponse>(`/assets/${assetId}/comments`, {
        body: body.trim() || undefined,
        rating: pendingRating || undefined,
      });
      toast(res.message, res.data && res.data.status !== "approved" ? "info" : "success");
      setBody("");
      if (res.rating) {
        setAvgRating(res.rating.avg_rating);
        setRatingCount(res.rating.rating_count);
        setCommittedRating(res.rating.your_rating);
        setPendingRating(res.rating.your_rating);
        onRatingChange?.(res.rating);
      }
      if (res.data?.status === "approved") void mutate();
    } catch (e) {
      toast((e as { firstError?: string }).firstError ?? "Could not submit.", "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await destroy(`/comments/${id}`);
      void mutate();
      toast("Comment deleted.", "success");
    } catch {
      toast("Could not delete comment.", "error");
    }
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <MessageSquare className="size-5 text-accent" /> Comments and Ratings
        </h2>
        {data?.meta?.total != null && <span className="text-sm text-ink-mute">({data.meta.total})</span>}
        {avgRating != null && ratingCount > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-ink-soft">
            <StarRating value={avgRating} size="size-3.5" />
            {avgRating.toFixed(1)} · {ratingCount} rating{ratingCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="mb-6 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
          {user?.name?.[0]?.toUpperCase() ?? "?"}
        </span>
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <StarRating
              value={pendingRating}
              onChange={(v) => (token ? setPendingRating(v) : openLoginPrompt("Sign in to rate this recording."))}
              size="size-5"
            />
            {pendingRating > 0 && (
              <button
                type="button"
                onClick={() => setPendingRating(0)}
                className="text-xs font-semibold text-ink-mute transition hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
          {allowComments ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder={token ? "Share your thoughts on this recording (optional)…" : "Sign in to comment or rate…"}
              onFocus={() => !token && openLoginPrompt("Sign in to comment or rate this recording.")}
              className="w-full resize-none rounded-card border border-edge bg-raised px-4 py-3 text-sm outline-none transition placeholder:text-ink-mute focus:border-accent"
            />
          ) : (
            <p className="text-sm text-ink-mute">Comments are disabled for this content — you can still leave a rating.</p>
          )}
          <div className="mt-2 flex justify-end">
            <button
              onClick={submit}
              disabled={!hasChanges || busy}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-1.5 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-40"
            >
              <Send className="size-3.5" /> Post
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading && <p className="text-sm text-ink-mute">Loading comments…</p>}
        {!isLoading && comments.length === 0 && (
          <p className="text-sm text-ink-mute">No comments yet — be the first to share a memory or a rating.</p>
        )}
        {comments.map((c) => (
          <CommentRow key={c.id} comment={c} onDelete={() => remove(c.id)} />
        ))}
      </div>
    </section>
  );
}

function CommentRow({ comment: c, onDelete }: { comment: Comment; onDelete: () => void }) {
  return (
    <div className="group flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-raised text-sm font-bold text-ink-soft">
        {(c.author ?? "L")[0].toUpperCase()}
      </span>
      <div className="min-w-0 flex-1 rounded-card bg-raised/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{c.author ?? "Listener"}</p>
          {c.rating != null && <StarRating value={c.rating} size="size-3" />}
          <p className="text-[11px] text-ink-mute">{timeAgo(c.created_at)}</p>
          {c.is_mine && (
            <button
              onClick={onDelete}
              aria-label="Delete comment"
              className="ml-auto hidden text-ink-mute transition hover:text-danger group-hover:block"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        {c.body && <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{c.body}</p>}
      </div>
    </div>
  );
}
