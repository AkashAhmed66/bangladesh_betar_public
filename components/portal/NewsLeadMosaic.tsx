"use client";

/* eslint-disable @next/next/no-img-element */
import { Clock3, Newspaper } from "lucide-react";
import Link from "next/link";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { NewsArticle } from "@/lib/types";

function StoryImage({ story, eager = false }: { story: NewsArticle; eager?: boolean }) {
  return story.image_url ? <img src={story.image_url} alt="" loading={eager ? "eager" : "lazy"} className="size-full object-cover transition duration-500 group-hover:scale-[1.025]" /> : <span className="grid size-full place-items-center bg-sunken text-ink-mute"><Newspaper className="size-8" /></span>;
}

function Meta({ story }: { story: NewsArticle }) {
  const { t } = useTranslation();
  return <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-mute"><Clock3 className="size-3.5" /> {story.published}<span aria-hidden="true">·</span>{t("news.readTime", { minutes: story.read_time_minutes })}</p>;
}

function RailStory({ story }: { story: NewsArticle }) {
  const { locale } = useTranslation();
  return <article className="group border-b border-edge py-4 first:pt-0"><Link href={`/news/${story.slug}`} className="grid grid-cols-[6.25rem_minmax(0,1fr)] gap-3"><div className="aspect-[4/3] overflow-hidden bg-sunken"><StoryImage story={story} /></div><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.13em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</p><h3 className="mt-1 clamp-3 font-bangla text-base font-bold leading-[1.16] group-hover:underline">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h3></div></Link></article>;
}

export default function NewsLeadMosaic({ stories, label }: { stories: NewsArticle[]; label: string }) {
  const { locale } = useTranslation();
  const lead = stories[0];
  if (!lead) return null;
  const title = localizedText(lead as unknown as Record<string, unknown>, "title", locale);
  const summary = localizedText(lead as unknown as Record<string, unknown>, "summary", locale);
  const category = localizedText(lead as unknown as Record<string, unknown>, "category", locale);

  return <section className="news-lead-mosaic grid min-w-0 items-start gap-x-7 gap-y-8 border-b border-edge pb-8 lg:grid-cols-[minmax(14rem,.72fr)_minmax(0,1.5fr)_minmax(17rem,.8fr)]" aria-label={label}>
    <article className="group min-w-0 lg:h-full"><Link href={`/news/${lead.slug}`} className="flex h-full flex-col"><div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{category}</p><h2 className="mt-3 text-balance font-bangla text-3xl font-bold leading-[1.05] tracking-[-0.04em] group-hover:text-[var(--portal-color)] sm:text-4xl">{title}</h2><p className="mt-4 clamp-6 text-sm leading-6 text-ink-soft">{summary}</p></div><span className="mt-auto block pt-6"><Meta story={lead} /></span></Link></article>
    <article className="group min-w-0"><Link href={`/news/${lead.slug}`} className="block"><div className="aspect-[16/10] overflow-hidden bg-sunken"><StoryImage story={lead} eager /></div><p className="mt-3 text-sm leading-6 text-ink-soft sm:text-base">{summary}</p></Link></article>
    <div className="min-w-0 border-t border-edge lg:border-t-0" aria-label={label}>{stories.slice(1, 5).map((story) => <RailStory key={story.id} story={story} />)}</div>
  </section>;
}
