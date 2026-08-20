"use client";

/* eslint-disable @next/next/no-img-element */
import { AlertCircle, ArrowLeft, ArrowRight, Check, Clock3, Copy, LoaderCircle, Newspaper, Quote, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { useApi, useNewsArticle } from "@/lib/hooks";
import type { NewsArticle, Paginated } from "@/lib/types";

function categorySlug(category: string): string {
  return category.toLowerCase().replaceAll("&", "and").replaceAll(" ", "-");
}

function publishedDate(value: string | null): string {
  if (!value) return "Recently published";
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(value));
}

function RelatedStory({ story }: { story: NewsArticle }) {
  return (
    <Link href={`/news/${story.slug}`} className="group grid min-w-0 gap-4 border-t border-edge pt-5 sm:grid-cols-[9rem_1fr]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-sunken">
        {story.image_url ? <img src={story.image_url} alt="" loading="lazy" className="editorial-image size-full object-cover" /> : <div className="grid size-full place-items-center text-ink-mute"><Newspaper className="size-7" /></div>}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{story.category}</p>
        <h3 className="mt-1 font-display text-lg font-bold leading-snug group-hover:underline">{story.title}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-mute"><Clock3 className="size-3.5" /> {story.read_time}</p>
      </div>
    </Link>
  );
}

export default function NewsStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, error, isLoading } = useNewsArticle(slug);
  const [copied, setCopied] = useState(false);
  const story = data?.data;
  const relatedPath = story ? `/news?category=${encodeURIComponent(categorySlug(story.category))}&per_page=5` : null;
  const { data: relatedResponse } = useApi<Paginated<NewsArticle>>(relatedPath);
  const related = (relatedResponse?.data ?? []).filter((article) => article.id !== story?.id).slice(0, 3);

  if (isLoading) return <div className="grid min-h-[32rem] place-items-center"><div className="flex items-center gap-3 text-sm font-bold text-ink-soft"><LoaderCircle className="size-6 animate-spin text-[var(--portal-color)]" /> Opening the newsroom…</div></div>;
  if (error || !story) {
    return <div className="mx-auto grid min-h-[32rem] max-w-xl place-items-center px-5 text-center"><div><AlertCircle className="mx-auto size-9 text-[var(--portal-color)]" /><h1 className="mt-4 font-display text-3xl font-bold">Article not available</h1><p className="mt-2 text-sm text-ink-soft">This story may be unpublished or no longer available.</p><Link href="/news" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-page"><ArrowLeft className="size-4" /> Back to News</Link></div></div>;
  }

  const share = async () => {
    const payload = { title: story.title, text: story.summary, url: window.location.href };
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const highlights = story.body.slice(0, 3).map((paragraph) => {
    const firstSentence = paragraph.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
    return firstSentence ?? paragraph;
  });

  return (
    <article className="pb-24">
      <header className="relative overflow-hidden border-b border-edge">
        {story.image_url && <img src={story.image_url} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover opacity-[0.08] blur-3xl" />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-elev" />
        <div className="relative mx-auto w-full max-w-[1480px] px-4 pb-10 pt-7 sm:px-7 sm:pb-14 sm:pt-10 lg:px-10">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-ink-mute" aria-label="Breadcrumb">
            <Link href="/news" className="hover:text-ink">News</Link><span>/</span>
            <Link href={`/news/category/${categorySlug(story.category)}`} className="text-[var(--portal-color)] hover:underline">{story.category}</Link>
          </nav>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
            <div className="max-w-5xl">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--portal-color)]"><Sparkles className="size-3.5" /> Public-interest journalism</p>
              <h1 className="mt-4 max-w-5xl text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{story.title}</h1>
              <p className="mt-6 max-w-4xl text-lg leading-relaxed text-ink-soft sm:text-xl lg:text-2xl">{story.summary}</p>
            </div>
            <div className="border-l-4 border-[var(--portal-color)] pl-5">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-ink-mute">Filed by</p>
              <p className="mt-1 font-display text-xl font-bold">Betar Newsroom</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">Verified public-service reporting from Bangladesh Betar.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-edge pt-5 text-sm text-ink-mute">
            <span>{publishedDate(story.published_at)}</span>
            <span className="hidden size-1 rounded-full bg-ink-mute sm:block" />
            <span className="flex items-center gap-1.5"><Clock3 className="size-4" /> {story.read_time}</span>
            <button type="button" onClick={() => void share()} className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-edge bg-raised px-4 font-bold text-ink-soft transition hover:bg-highlight hover:text-ink">
              {copied ? <Check className="size-4 text-success" /> : <Share2 className="size-4" />} {copied ? "Link copied" : "Share story"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-7 lg:px-10">
        <figure className="relative -mt-px overflow-hidden rounded-b-panel bg-sunken shadow-2xl shadow-shade/20">
          <div className="aspect-[16/9] sm:aspect-[2/1] lg:aspect-[2.25/1]">
            {story.image_url ? <img src={story.image_url} alt={`Editorial image for ${story.title}`} className="size-full object-cover" /> : <div className="grid size-full place-items-center text-ink-mute"><Newspaper className="size-16" /></div>}
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-edge bg-raised px-4 py-3 text-xs text-ink-mute sm:px-5"><span>{story.title}</span><span>Bangladesh Betar Newsroom</span></figcaption>
        </figure>

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,48rem)_minmax(17rem,1fr)] lg:gap-20">
          <div>
            <div className="story-prose space-y-7 font-bangla text-lg leading-8 text-ink-soft sm:text-xl sm:leading-9">
              {story.body.map((paragraph, index) => <p key={`${story.id}-${index}`}>{paragraph}</p>)}
            </div>

            <blockquote className="portal-tint-panel relative mt-12 overflow-hidden rounded-panel p-7 sm:p-9">
              <Quote className="absolute right-5 top-5 size-14 text-[var(--portal-color)] opacity-15" />
              <p className="relative font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl">“{story.summary}”</p>
              <footer className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">The story in context</footer>
            </blockquote>

            <div className="mt-12 flex flex-wrap items-center gap-2 border-y border-edge py-5">
              <span className="mr-2 text-xs font-black uppercase tracking-[0.14em] text-ink-mute">Filed under</span>
              {[story.category, "Bangladesh", "Public service"].filter((value, index, all) => all.indexOf(value) === index).map((tag) => <span key={tag} className="rounded-full bg-raised px-3 py-1.5 text-xs font-bold text-ink-soft">{tag}</span>)}
              <button type="button" onClick={() => void share()} className="ml-auto grid size-10 place-items-center rounded-full border border-edge text-ink-soft hover:bg-highlight hover:text-ink" aria-label="Copy or share this article"><Copy className="size-4" /></button>
            </div>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-5">
            <section className="rounded-panel border border-edge bg-raised p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">At a glance</p>
              <ul className="mt-5 space-y-4">
                {highlights.map((highlight, index) => <li key={index} className="flex gap-3 text-sm leading-relaxed text-ink-soft"><span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--portal-color)] text-[10px] font-black text-white">{index + 1}</span><span>{highlight}</span></li>)}
              </ul>
            </section>

            <section className="border-t-4 border-[var(--portal-color)] bg-sunken p-6">
              <Newspaper className="size-7 text-[var(--portal-color)]" />
              <h2 className="mt-4 font-display text-2xl font-bold">Independent public reporting</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Bangladesh Betar connects national developments with the communities they affect.</p>
              <Link href="/news/latest" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--portal-color)] hover:gap-3">See the latest news <ArrowRight className="size-4" /></Link>
            </section>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-edge pt-10">
            <div className="flex items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">Continue reading</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">More in {story.category}</h2></div><Link href={`/news/category/${categorySlug(story.category)}`} className="hidden items-center gap-2 text-sm font-black text-ink-soft hover:text-ink sm:flex">View section <ArrowRight className="size-4" /></Link></div>
            <div className="mt-7 grid gap-7 lg:grid-cols-3">{related.map((article) => <RelatedStory key={article.id} story={article} />)}</div>
          </section>
        )}
      </div>
    </article>
  );
}
