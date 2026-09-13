"use client";

/* eslint-disable @next/next/no-img-element */
import { Clock3, Newspaper } from "lucide-react";
import Link from "next/link";
import { localizedText, useTranslation } from "@/lib/i18n";
import type { NewsArticle } from "@/lib/types";

function StoryImage({ story, eager = false }: { story: NewsArticle; eager?: boolean }) {
  return story.image_url ? <img src={story.image_url} alt="" loading={eager ? "eager" : "lazy"} className="size-full object-cover transition duration-500 group-hover:scale-[1.025]" /> : <span className="grid size-full place-items-center bg-sunken text-ink-mute"><Newspaper className="size-8" /></span>;
}

function SmallStory({ story }: { story: NewsArticle }) {
  const { locale, t } = useTranslation();
  const summary = localizedText(story as unknown as Record<string, unknown>, "summary", locale);
  return <article className="group min-w-0 border-b border-edge pb-5"><Link href={`/news/${story.slug}`} className="block"><div className="aspect-[16/9] overflow-hidden bg-sunken"><StoryImage story={story} /></div><p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "category", locale)}</p><h3 className="mt-1 clamp-3 font-bangla text-lg font-bold leading-[1.16] group-hover:text-[var(--portal-color)]">{localizedText(story as unknown as Record<string, unknown>, "title", locale)}</h3>{summary && <p className="mt-2 clamp-2 text-sm leading-5 text-ink-soft">{summary}</p>}<p className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-mute"><Clock3 className="size-3.5" /> {story.published}<span aria-hidden="true">·</span>{t("news.readTime", { minutes: story.read_time_minutes })}</p></Link></article>;
}

export default function NewsLeadMosaic({ stories, label }: { stories: NewsArticle[]; label: string }) {
  const { locale, t } = useTranslation();
  const lead = stories[0];
  if (!lead) return null;
  const title = localizedText(lead as unknown as Record<string, unknown>, "title", locale);
  const summary = localizedText(lead as unknown as Record<string, unknown>, "summary", locale);
  const category = localizedText(lead as unknown as Record<string, unknown>, "category", locale);

  return <section className="news-lead-mosaic grid min-w-0 gap-x-6 gap-y-7 border-b border-edge pb-8 sm:grid-cols-2 lg:grid-cols-3" aria-label={label}>
    <article className="group relative min-h-[25rem] overflow-hidden bg-sunken sm:col-span-2 lg:row-start-1">
      <Link href={`/news/${lead.slug}`} className="absolute inset-0">
        <StoryImage story={lead} eager />
        <span className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 block p-5 text-white sm:p-8">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/75">{category}</span>
          <span className="mt-2 block max-w-4xl text-balance font-bangla text-3xl font-bold leading-[1.06] tracking-[-0.035em] sm:text-5xl">{title}</span>
          <span className="mt-3 hidden max-w-3xl clamp-2 text-sm leading-6 text-white/80 sm:block">{summary}</span>
          <span className="mt-4 flex items-center gap-2 text-[11px] text-white/70"><Clock3 className="size-3.5" /> {lead.published}<span aria-hidden="true">·</span>{t("news.readTime", { minutes: lead.read_time_minutes })}</span>
        </span>
      </Link>
    </article>
    {stories.slice(1, 5).map((story) => <SmallStory key={story.id} story={story} />)}
  </section>;
}
