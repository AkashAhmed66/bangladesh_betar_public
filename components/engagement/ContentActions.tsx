"use client";

import { Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { get, put } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

export type ReactionContentType =
  | "news_article"
  | "watch_show"
  | "audio_asset"
  | "song"
  | "album"
  | "artist"
  | "programme"
  | "episode"
  | "podcast_channel"
  | "podcast_episode"
  | "audio_book"
  | "playlist"
  | "broadcast_channel";

interface ReactionSummary {
  likes: number;
  dislikes: number;
  my_reaction: "like" | "dislike" | null;
}

interface ContentActionsProps {
  type: ReactionContentType;
  id: number;
  title: string;
  text?: string;
  url?: string;
  tone?: "default" | "on-dark";
  className?: string;
}

const EMPTY_SUMMARY: ReactionSummary = { likes: 0, dislikes: 0, my_reaction: null };

/** Shared persisted like/dislike controls plus guest-accessible native sharing. */
export default function ContentActions({ type, id, title, text, url, tone = "default", className = "" }: ContentActionsProps) {
  const { t } = useTranslation();
  const token = useAuth((state) => state.token);
  const openLogin = useUi((state) => state.openLoginPrompt);
  const toast = useUi((state) => state.toast);
  const [summary, setSummary] = useState<ReactionSummary>(EMPTY_SUMMARY);
  const [busy, setBusy] = useState<"like" | "dislike" | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    get<{ data: ReactionSummary }>(`/reactions/${type}/${id}`, controller.signal)
      .then((response) => setSummary(response.data))
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") setSummary(EMPTY_SUMMARY);
      });
    return () => controller.abort();
  }, [id, token, type]);

  const react = async (reaction: "like" | "dislike") => {
    if (!token) {
      openLogin(t("engagement.loginToReact"));
      return;
    }
    if (busy) return;

    const previous = summary;
    const removing = previous.my_reaction === reaction;
    setBusy(reaction);
    setSummary({
      likes: Math.max(0, previous.likes + (reaction === "like" ? (removing ? -1 : 1) : previous.my_reaction === "like" ? -1 : 0)),
      dislikes: Math.max(0, previous.dislikes + (reaction === "dislike" ? (removing ? -1 : 1) : previous.my_reaction === "dislike" ? -1 : 0)),
      my_reaction: removing ? null : reaction,
    });

    try {
      const response = await put<{ data: ReactionSummary }>(`/reactions/${type}/${id}`, { reaction });
      setSummary(response.data);
    } catch {
      setSummary(previous);
      toast(t("engagement.reactionFailed"), "error");
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    const link = url ?? (typeof window !== "undefined" ? window.location.href : "");
    if (!link) return;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: text ?? title, url: link });
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") toast(t("engagement.shareFailed"), "error");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast(t("engagement.linkCopied"), "success");
    } catch {
      toast(t("engagement.shareFailed"), "error");
    }
  };

  const base = tone === "on-dark"
    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
    : "border-edge bg-raised text-ink-soft hover:border-edge-strong hover:bg-highlight hover:text-ink";
  const active = tone === "on-dark"
    ? "border-white/45 bg-white text-black"
    : "border-[var(--portal-color)] bg-[color-mix(in_srgb,var(--portal-color)_14%,transparent)] text-[var(--portal-color)]";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label={t("engagement.actions")}>
      <button type="button" onClick={() => void react("like")} disabled={busy !== null} aria-label={t("engagement.like")} aria-pressed={summary.my_reaction === "like"} title={t("engagement.like")} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-bold backdrop-blur-md transition disabled:cursor-wait disabled:opacity-70 ${summary.my_reaction === "like" ? active : base}`}>
        <ThumbsUp className={`size-4.5 ${summary.my_reaction === "like" ? "fill-current" : ""}`} />
        <span>{summary.likes.toLocaleString()}</span>
      </button>
      <button type="button" onClick={() => void react("dislike")} disabled={busy !== null} aria-label={t("engagement.dislike")} aria-pressed={summary.my_reaction === "dislike"} title={t("engagement.dislike")} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-bold backdrop-blur-md transition disabled:cursor-wait disabled:opacity-70 ${summary.my_reaction === "dislike" ? active : base}`}>
        <ThumbsDown className={`size-4.5 ${summary.my_reaction === "dislike" ? "fill-current" : ""}`} />
        <span>{summary.dislikes.toLocaleString()}</span>
      </button>
      <button type="button" onClick={() => void share()} aria-label={t("engagement.share")} title={t("engagement.share")} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-bold backdrop-blur-md transition ${base}`}>
        <Share2 className="size-4.5" />
        <span>{t("engagement.share")}</span>
      </button>
    </div>
  );
}
