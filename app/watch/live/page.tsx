import { CirclePlay, Radio } from "lucide-react";
import WatchListingPage from "@/components/portal/WatchListingPage";

export default function LiveTvPage() {
  return (
    <div>
      <section className="bg-black px-4 py-10 text-white sm:px-7 sm:py-14 lg:px-10">
        <div className="mx-auto grid min-h-72 max-w-[1460px] items-center gap-7 rounded-panel border border-white/10 bg-gradient-to-br from-[#162b30] to-[#111215] p-7 sm:p-10 md:grid-cols-[auto_1fr_auto]">
          <span className="grid size-18 place-items-center rounded-full bg-danger text-white shadow-xl shadow-danger/25"><Radio className="size-8" /></span>
          <div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#75e3df]"><span className="size-2 animate-pulse rounded-full bg-danger" /> Live television</p><h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Betar News 24</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">Continuous public news, parliament, weather and national events from Bangladesh Betar.</p></div>
          <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black"><CirclePlay className="size-5" /> Watch live</button>
        </div>
      </section>
      <WatchListingPage title="Live and scheduled television" description="Published live television entries managed through the Watch admin section appear here." categorySlug="live-tv" showHomeLink={false} />
    </div>
  );
}
