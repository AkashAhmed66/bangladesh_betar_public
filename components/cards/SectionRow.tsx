"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import MediaCard from "./MediaCard";
import { SectionHeading, Skeleton } from "@/components/ui/Misc";
import type { CatalogueItem } from "@/lib/types";

interface SectionRowProps {
  title: React.ReactNode;
  items?: CatalogueItem[];
  href?: string;
  loading?: boolean;
}

/** Horizontal scroll shelf with arrow paging — the Spotify home-row unit. */
export default function SectionRow({ title, items, href, loading }: SectionRowProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 24);
    setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 24);
  };

  if (!loading && !items?.length) return null;

  return (
    <section className="group/row space-y-3 sm:space-y-4">
      <SectionHeading
        title={title}
        action={
          <div className="flex items-center gap-2">
            {href && (
              <Link href={href} className="rounded-full border border-edge bg-raised px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-ink-soft transition hover:border-edge-strong hover:text-ink">
                Show all
              </Link>
            )}
            <div className="hidden gap-2 md:flex">
              <button
                onClick={() => page(-1)}
                disabled={atStart}
                aria-label="Scroll left"
                className="grid size-10 place-items-center rounded-full border border-edge bg-raised text-ink-soft shadow-sm transition enabled:hover:border-edge-strong enabled:hover:bg-highlight enabled:hover:text-ink disabled:opacity-30"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => page(1)}
                disabled={atEnd}
                aria-label="Scroll right"
                className="grid size-10 place-items-center rounded-full border border-edge bg-raised text-ink-soft shadow-sm transition enabled:hover:border-edge-strong enabled:hover:bg-highlight enabled:hover:text-ink disabled:opacity-30"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        }
      />
      <div
        ref={scroller}
        onScroll={onScroll}
        className="media-shelf-scroll -mx-4 flex scroll-px-4 gap-4 overflow-x-auto px-4 pb-5 sm:-mx-7 sm:gap-5 sm:px-7 [&>a]:w-52 [&>a]:shrink-0 sm:[&>a]:w-60 lg:[&>a]:w-64"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-52 shrink-0 sm:w-60 lg:w-64">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="mt-3 h-3.5 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))
          : items!.map((item) => <MediaCard key={`${item.type}:${item.id}`} item={item} />)}
      </div>
    </section>
  );
}
