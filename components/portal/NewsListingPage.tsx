"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowLeft, ArrowRight, Clock3, LoaderCircle, Newspaper } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useNewsArticles } from "@/lib/hooks";
import type { NewsArticle } from "@/lib/types";

interface NewsListingPageProps {
  title: string;
  description: string;
  categorySlug?: string;
  latest?: boolean;
}

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/news/${article.slug}`} className="group block min-w-0">
      <div className="relative aspect-[16/10] overflow-hidden rounded-panel bg-sunken">
        {article.image_url ? (
          <img src={article.image_url} alt="" loading="lazy" className="editorial-image size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-ink-mute"><Newspaper className="size-10" /></div>
        )}
      </div>
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--portal-color)]">{article.category}</p>
      <h2 className="mt-1 break-words font-display text-xl font-bold leading-tight tracking-[-0.025em] group-hover:underline">{article.title}</h2>
      <p className="mt-2 clamp-2 text-sm leading-relaxed text-ink-soft">{article.summary}</p>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-mute"><Clock3 className="size-3.5" /> {article.published} · {article.read_time}</p>
    </Link>
  );
}

export default function NewsListingPage({ title, description, categorySlug, latest = false }: NewsListingPageProps) {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useNewsArticles({ category: categorySlug, page, perPage: 12, sort: latest ? "latest" : undefined });
  const articles = data?.data ?? [];
  const currentPage = data?.meta?.current_page ?? page;
  const lastPage = data?.meta?.last_page ?? currentPage;

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 pb-20 pt-8 sm:px-7 sm:pt-12 lg:px-10">
      <div className="border-b border-edge pb-8 sm:flex sm:items-end sm:justify-between sm:gap-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--portal-color)]">Betar News</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">{description}</p>
        </div>
        <Link href="/news" className="mt-5 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-edge px-5 text-sm font-bold text-ink-soft transition hover:bg-highlight hover:text-ink sm:mt-0"><ArrowLeft className="size-4" /> Top stories</Link>
      </div>

      {isLoading ? (
        <div className="grid min-h-[24rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" /> Loading articles…</div></div>
      ) : error ? (
        <div className="grid min-h-[24rem] place-items-center text-center"><div><AlertCircle className="mx-auto size-9 text-danger" /><h2 className="mt-4 font-display text-2xl font-bold">This section could not be loaded</h2><p className="mt-2 text-sm text-ink-soft">Please try again shortly.</p></div></div>
      ) : articles.length === 0 ? (
        <div className="grid min-h-[24rem] place-items-center rounded-panel border border-dashed border-edge bg-raised px-6 text-center"><div><Newspaper className="mx-auto size-10 text-ink-mute" /><h2 className="mt-4 font-display text-2xl font-bold">No published articles yet</h2><p className="mt-2 text-sm text-ink-soft">Articles assigned to this section in the admin portal will appear here automatically.</p></div></div>
      ) : (
        <div className="mt-9 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
        </div>
      )}

      {lastPage > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3" aria-label="News pagination">
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edge px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="size-4" /> Previous</button>
          <span className="px-2 text-sm font-bold text-ink-mute">Page {currentPage} of {lastPage}</span>
          <button type="button" disabled={currentPage >= lastPage} onClick={() => setPage((value) => Math.min(lastPage, value + 1))} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-edge px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">Next <ArrowRight className="size-4" /></button>
        </nav>
      )}
    </div>
  );
}
