import { ArrowRight, CirclePlay, Info, Radio, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WATCH_SHOWS, type DemoWatchShow } from "@/lib/demoContent";

function ShowCard({ show, rank }: { show: DemoWatchShow; rank?: number }) {
  return (
    <Link href={`/watch/${show.slug}`} className="group block min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-card bg-sunken shadow-xl shadow-shade/15">
        <Image src={show.image} alt="" fill sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 27vw" className="editorial-image object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        {rank && <span className="absolute -bottom-3 -left-1 font-display text-7xl font-black leading-none text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.8)]">{rank}</span>}
        <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white text-black opacity-100 shadow-lg transition sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"><CirclePlay className="size-5" /></span>
      </div>
      <div className={rank ? "pl-10" : ""}>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--portal-color)]">{show.eyebrow}</p>
        <h3 className="mt-1 clamp-1 font-display text-lg font-bold tracking-tight group-hover:underline">{show.title}</h3>
        <p className="mt-1 clamp-2 text-xs leading-relaxed text-ink-mute">{show.description}</p>
      </div>
    </Link>
  );
}

function Shelf({ id, title, shows, ranked = false }: { id: string; title: string; shows: DemoWatchShow[]; ranked?: boolean }) {
  return (
    <section id={id} className="scroll-mt-32">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="editorial-rule font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <Link href="#categories" className="hidden items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-ink-mute hover:text-ink sm:flex">View all <ArrowRight className="size-3.5" /></Link>
      </div>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-7 sm:px-7 [&::-webkit-scrollbar]:hidden">
        {shows.map((show, index) => <div key={show.slug} className="w-[78vw] max-w-[22rem] shrink-0 sm:w-[20rem] lg:w-[22rem]"><ShowCard show={show} rank={ranked ? index + 1 : undefined} /></div>)}
      </div>
    </section>
  );
}

export default function WatchPage() {
  const featured = WATCH_SHOWS[0];
  const docs = WATCH_SHOWS.filter((show) => show.category === "Documentary");
  const culture = WATCH_SHOWS.filter((show) => show.category === "Culture");
  const kids = WATCH_SHOWS.filter((show) => show.category === "Kids");

  return (
    <div className="w-full min-w-0 max-w-full pb-20">
      <section id="drama" className="relative min-h-[32rem] overflow-hidden bg-black text-white scroll-mt-32 sm:min-h-[38rem] lg:min-h-[43rem]">
        <Image src={featured.image} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/58 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/15" />
        <div className="relative mx-auto flex min-h-[32rem] max-w-[1540px] items-end px-4 pb-12 pt-24 sm:min-h-[38rem] sm:px-8 sm:pb-16 lg:min-h-[43rem] lg:px-12">
          <div className="min-w-0 max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#75e3df]"><Sparkles className="size-4" /> {featured.eyebrow}</p>
            <h1 className="mt-3 break-words font-display text-5xl font-bold leading-none tracking-[-0.055em] sm:text-7xl">{featured.title}</h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-lg">{featured.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/watch/${featured.slug}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black transition hover:scale-[1.02]"><CirclePlay className="size-5" /> Watch now</Link>
              <Link href={`/watch/${featured.slug}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-6 text-sm font-black text-white backdrop-blur transition hover:bg-white/25"><Info className="size-5" /> More info</Link>
            </div>
            <p className="mt-5 text-xs font-bold text-white/55">{featured.year} · {featured.rating} · {featured.category} · {featured.episodes.length} episodes</p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-14 px-4 pt-10 sm:px-7 sm:pt-12 lg:px-10">
        <section id="live" className="overflow-hidden rounded-panel border border-edge bg-raised scroll-mt-32">
          <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr_auto]">
            <span className="grid size-15 place-items-center rounded-full bg-danger text-white shadow-lg shadow-danger/20"><Radio className="size-6" /></span>
            <div>
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-danger"><span className="size-2 animate-pulse rounded-full bg-danger" /> Live television</p>
              <h2 className="mt-1 font-display text-2xl font-bold">Betar News 24</h2>
              <p className="mt-1 text-sm text-ink-soft">Continuous public news, parliament, weather and national events.</p>
            </div>
            <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-page"><CirclePlay className="size-4" /> Watch live</button>
          </div>
        </section>

        <Shelf id="trending" title="Trending now" shows={WATCH_SHOWS.slice(0, 6)} ranked />
        <Shelf id="documentary" title="Documentaries that take you further" shows={[...docs, ...WATCH_SHOWS.slice(0, 2)]} />
        <Shelf id="culture" title="Culture, music & performance" shows={[...culture, WATCH_SHOWS[2], WATCH_SHOWS[4]]} />
        <Shelf id="kids" title="For young explorers" shows={[...kids, WATCH_SHOWS[6], WATCH_SHOWS[1]]} />

        <section id="categories" className="scroll-mt-32">
          <h2 className="editorial-rule font-display text-2xl font-bold sm:text-3xl">Browse categories</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Drama", "#7c2846"], ["Documentary", "#146b62"], ["Culture", "#8a4a16"], ["Kids", "#315fa8"],
            ].map(([label, color]) => (
              <Link key={label} href={`/watch#${label.toLowerCase()}`} className="group relative min-h-32 overflow-hidden rounded-panel p-5 text-white" style={{ background: color }}>
                <span className="absolute -bottom-10 -right-8 size-28 rounded-full border-[16px] border-white/10 transition group-hover:scale-125" />
                <span className="relative font-display text-xl font-bold">{label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
