"use client";

import { BookOpenText, Clock } from "lucide-react";
import Link from "next/link";
import ListenPageHero from "@/components/cards/ListenPageHero";
import { PremiumBadge, Skeleton } from "@/components/ui/Misc";
import Artwork from "@/components/ui/Artwork";
import { formatDuration } from "@/lib/format";
import { useAudioBooks } from "@/lib/hooks";
import { localizedText, useTranslation } from "@/lib/i18n";

/** Premium narrated books — read the text while you listen. */
export default function AudioBooksPage() {
  const { locale, t } = useTranslation();
  const { data, isLoading } = useAudioBooks();
  const books = data?.data ?? [];

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <ListenPageHero
        eyebrow={t("listen.premiumListening")}
        title={t("listen.booksHero")}
        description={t("listen.booksDescription")}
        icon={<BookOpenText className="size-3.5" />}
        meta={books.length ? t("listen.booksAvailable", { count: books.length }) : t("listen.bilingualNarration")}
      />
      {isLoading && (
        <div className="grid grid-cols-1 gap-5 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-card" />)}
        </div>
      )}

      {!isLoading && books.length === 0 && (
        <div className="rounded-panel bg-raised p-10 text-center text-sm text-ink-mute">
          {t("listen.noBooks")}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 min-[440px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {books.map((book) => {
          return (
            <Link
              key={book.id}
              href={`/audiobooks/${book.id}`}
              className="group relative overflow-hidden rounded-panel border border-edge bg-raised/65 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-edge-strong hover:bg-raised hover:shadow-xl"
            >
              <div className="relative">
                <Artwork type="audio_book" id={book.id} url={book.artwork_url} title={localizedText(book as unknown as Record<string, unknown>, "title", locale)} className="aspect-square w-full" />
                <PremiumBadge className="absolute right-2 top-2" />
              </div>
              <p className={`mt-4 line-clamp-2 font-display text-lg font-bold leading-snug tracking-tight ${book.language === "bn" ? "font-bangla" : ""}`}>
                {localizedText(book as unknown as Record<string, unknown>, "title", locale)}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                {book.language === "bn" ? t("listen.bangla") : t("listen.english")}
                <span className="flex items-center gap-1"><Clock className="size-3" /> {formatDuration(Math.max(book.duration_male, book.duration_female, book.duration_enhanced ?? 0))}</span>
              </p>
              {book.author && <p className="mt-0.5 truncate text-[11px] text-ink-mute">{t("listen.byAuthor", { author: book.author })}</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
