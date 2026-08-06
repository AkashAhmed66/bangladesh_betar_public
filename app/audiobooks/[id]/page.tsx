"use client";

import { BookOpen, Crown, LogIn } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import HlsAudio from "@/components/ui/HlsAudio";
import { Skeleton } from "@/components/ui/Misc";
import { ApiError } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { useAudioBook } from "@/lib/hooks";
import { useUi } from "@/stores/ui";

/**
 * The read-along player: the narration plays in a sticky bar while the full
 * text scrolls below — see and hear the book at the same time. Premium only.
 */
export default function AudioBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading } = useAudioBook(id);
  const openLoginPrompt = useUi((s) => s.openLoginPrompt);
  const [voice, setVoice] = useState<"male" | "female" | "enhanced">("female");

  const book = data?.data;
  const status = error instanceof ApiError ? error.status : null;
  // Only narrations the API actually returned are offered; if the chosen
  // voice doesn't exist for this book, fall back to the first available.
  const available = useMemo(
    () => (["female", "male", "enhanced"] as const).filter((v) => Boolean(book?.streams?.[v])),
    [book],
  );
  const active = available.includes(voice) ? voice : available[0];
  const streamUrl = active ? (book?.streams?.[active] ?? null) : null;

  // Guests get the familiar sign-in modal straight away, not a lock screen.
  useEffect(() => {
    if (status === 401) openLoginPrompt("Sign in with a Premium account to read and listen to Audio Books.");
  }, [status, openLoginPrompt]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 w-full rounded-panel" />
        <Skeleton className="h-96 w-full rounded-panel" />
      </div>
    );
  }

  // ---- Locked states -------------------------------------------------
  if (status === 401 || status === 403) {
    const needsLogin = status === 401;
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-panel bg-raised px-8 py-14 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-premium/15 text-premium">
          <Crown className="size-8" />
        </span>
        <h1 className="font-display text-2xl font-bold">Audio Books are a Premium feature</h1>
        <p className="text-sm text-ink-soft">
          {needsLogin
            ? "Sign in with a Premium account to read and listen to narrated books in Bangla and English."
            : "Upgrade to Premium to read and listen to narrated books in Bangla and English."}
        </p>
        {needsLogin ? (
          <button
            onClick={() => openLoginPrompt("Sign in to access Audio Books.")}
            className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-fg transition hover:brightness-110"
          >
            <LogIn className="size-4" /> Sign in
          </button>
        ) : (
          <Link
            href="/premium"
            className="flex items-center gap-2 rounded-full bg-premium px-6 py-2.5 text-sm font-bold text-page transition hover:brightness-110"
          >
            <Crown className="size-4" /> Go Premium
          </Link>
        )}
        <Link href="/audiobooks" className="text-xs text-ink-mute hover:text-ink hover:underline">← Back to Audio Books</Link>
      </div>
    );
  }

  if (!book) {
    return <div className="rounded-panel bg-raised p-10 text-center text-sm text-ink-mute">Audio book not found.</div>;
  }

  const bn = book.language === "bn";

  return (
    <div className="flex flex-col gap-6">
      {/* ---- Sticky player: listen while you read ---- */}
      <div className="sticky top-0 z-30 -mx-4 bg-page/95 px-4 pb-3 pt-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="rounded-panel bg-elev p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-card bg-accent/15 text-accent">
              <BookOpen className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className={`truncate font-display text-lg font-bold ${bn ? "font-bangla" : ""}`}>{book.title}</h1>
              <p className="text-xs text-ink-mute">
                {bn ? "বাংলা" : "English"}{book.author ? ` · by ${book.author}` : ""} ·{" "}
                {formatDuration(
                  active === "male" ? book.duration_male
                    : active === "enhanced" ? (book.duration_enhanced ?? 0)
                    : book.duration_female,
                )}
              </p>
            </div>
            {/* Voice toggle — only the narrations this book actually has */}
            {available.length > 0 && (
              <div className="flex gap-1 rounded-full bg-raised p-1">
                {available.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVoice(v)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      active === v ? "bg-accent text-accent-fg" : "text-ink-mute hover:text-ink"
                    }`}
                  >
                    {v === "female" ? "Female voice" : v === "male" ? "Male voice" : "✦ Enhanced"}
                  </button>
                ))}
              </div>
            )}
          </div>
          {streamUrl && (
            // key forces a reload when the voice changes
            <HlsAudio key={active} src={streamUrl} className="mt-3 h-10 w-full" />
          )}
        </div>
      </div>

      {/* ---- The text: read along while listening ---- */}
      <article
        className={`mx-auto w-full max-w-3xl whitespace-pre-wrap rounded-panel bg-raised px-6 py-8 leading-loose text-ink-soft sm:px-10 ${
          bn ? "font-bangla text-lg" : "text-base"
        }`}
      >
        {book.text}
      </article>
    </div>
  );
}
