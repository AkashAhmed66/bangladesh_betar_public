import { ArrowLeft, Clock3, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NEWS_STORIES, newsStory } from "@/lib/demoContent";

export function generateStaticParams() {
  return NEWS_STORIES.map(({ slug }) => ({ slug }));
}

export default async function NewsStoryPage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const story = newsStory(slug);
  if (!story) notFound();

  return (
    <article className="mx-auto w-full max-w-5xl px-4 pb-20 pt-7 sm:px-7 sm:pt-10">
      <Link href="/news" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-ink-soft hover:text-ink"><ArrowLeft className="size-4" /> Back to News</Link>
      <div className="mt-6 max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--portal-color)]">{story.category}</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.04] tracking-[-0.045em] sm:text-6xl">{story.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">{story.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-edge py-4 text-sm text-ink-mute">
          <span className="font-bold text-ink">Betar Newsroom</span>
          <span className="flex items-center gap-1.5"><Clock3 className="size-4" /> {story.published} · {story.readTime}</span>
          <button type="button" className="ml-auto flex items-center gap-2 rounded-full border border-edge px-3 py-2 font-bold text-ink-soft"><Share2 className="size-4" /> Share</button>
        </div>
      </div>
      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-panel bg-sunken">
        <Image src={story.image} alt="" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
      </div>
      <div className="mx-auto mt-9 max-w-3xl">
        <p className="mb-7 rounded-card border border-edge bg-raised px-4 py-3 text-xs font-semibold text-ink-soft">This is demonstration content for the proposed Betar News experience.</p>
        <div className="space-y-6 font-bangla text-lg leading-8 text-ink-soft sm:text-xl sm:leading-9">
          {story.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
    </article>
  );
}
