"use client";

import { BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { PremiumBadge, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { artworkCss, artworkFor } from "@/lib/artwork";
import { formatDuration } from "@/lib/format";
import { useAudioBooks } from "@/lib/hooks";

/** Premium narrated books — read the text while you listen. */
export default function AudioBooksPage() {
  const { data, isLoading } = useAudioBooks();
  const books = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Audio Books</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Narrated books in Bangla and English — read along while you listen.
          A Premium feature.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-card" />)}
        </div>
      )}

      {!isLoading && books.length === 0 && (
        <div className="rounded-panel bg-raised p-10 text-center text-sm text-ink-mute">
          No audio books published yet — check back soon.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {books.map((book) => {
          const art = artworkFor("audio_book", book.id);
          return (
            <Link
              key={book.id}
              href={`/audiobooks/${book.id}`}
              className="group relative overflow-hidden rounded-card p-4 transition hover:scale-[1.02]"
              style={artworkCss(art)}
            >
              <PremiumBadge className="absolute right-2 top-2" />
              <BookOpen className="size-8 text-white/80" />
              <p className={`mt-6 line-clamp-2 font-display text-base font-bold text-white ${book.language === "bn" ? "font-bangla" : ""}`}>
                {book.title}
              </p>
              <p className="mt-1 flex items-center gap-2 text-xs text-white/70">
                {book.language === "bn" ? "বাংলা" : "English"}
                <span className="flex items-center gap-1"><Clock className="size-3" /> {formatDuration(Math.max(book.duration_male, book.duration_female, book.duration_enhanced ?? 0))}</span>
              </p>
              {book.author && <p className="mt-0.5 truncate text-[11px] text-white/60">by {book.author}</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
