import { ArrowLeft, CirclePlay, Clock3, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WATCH_SHOWS, watchShow } from "@/lib/demoContent";

export function generateStaticParams() {
  return WATCH_SHOWS.map(({ slug }) => ({ slug }));
}

export default async function WatchShowPage({ params }: PageProps<"/watch/[slug]">) {
  const { slug } = await params;
  const show = watchShow(slug);
  if (!show) notFound();

  return (
    <div className="pb-20">
      <section className="relative min-h-[30rem] overflow-hidden bg-black text-white sm:min-h-[38rem]">
        <Image src={show.image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10" />
        <div className="relative mx-auto flex min-h-[30rem] max-w-[1480px] flex-col justify-between px-4 py-8 sm:min-h-[38rem] sm:px-8 lg:px-12">
          <Link href="/watch" className="inline-flex w-fit min-h-11 items-center gap-2 text-sm font-bold text-white/75 hover:text-white"><ArrowLeft className="size-4" /> Back to Watch</Link>
          <div className="max-w-2xl pb-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#75e3df]">{show.eyebrow}</p>
            <h1 className="mt-3 font-display text-5xl font-bold leading-none tracking-[-0.05em] sm:text-7xl">{show.title}</h1>
            <p className="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">{show.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button type="button" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black"><CirclePlay className="size-5" /> Play episode 1</button>
              <button type="button" className="grid size-12 place-items-center rounded-full bg-white/15 backdrop-blur" aria-label="Add to watchlist"><Plus className="size-5" /></button>
              <span className="text-xs font-bold text-white/55">{show.year} · {show.rating} · {show.category}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 pt-10 sm:px-7">
        <div className="mb-8 rounded-card border border-edge bg-raised px-4 py-3 text-xs font-semibold text-ink-soft">This is demonstration OTT content. Video streaming can be connected when a video catalogue API is introduced.</div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">Season 1</p>
            <h2 className="mt-1 font-display text-3xl font-bold">Episodes</h2>
          </div>
          <span className="text-sm font-bold text-ink-mute">{show.episodes.length} episodes</span>
        </div>
        <div className="mt-6 divide-y divide-edge border-y border-edge">
          {show.episodes.map((episode, index) => (
            <article key={episode.title} className="group grid gap-4 py-5 sm:grid-cols-[2.5rem_12rem_1fr_auto] sm:items-center">
              <span className="hidden font-display text-xl font-bold text-ink-mute sm:block">{String(index + 1).padStart(2, "0")}</span>
              <div className="relative aspect-video overflow-hidden rounded-card bg-sunken">
                <Image src={show.image} alt="" fill sizes="12rem" className="object-cover transition group-hover:scale-105" />
                <span className="absolute inset-0 grid place-items-center bg-black/15"><CirclePlay className="size-8 text-white drop-shadow" /></span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">{episode.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{episode.description}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink-mute"><Clock3 className="size-3.5" /> {episode.duration}</span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
