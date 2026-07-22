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
    <section className="group/row">
      <SectionHeading
        title={title}
        action={
          <div className="flex items-center gap-2">
            {href && (
              <Link href={href} className="text-xs font-bold uppercase tracking-wider text-ink-mute transition hover:text-ink">
                Show all
              </Link>
            )}
            <div className="hidden gap-1 opacity-0 transition group-hover/row:opacity-100 md:flex">
              <button
                onClick={() => page(-1)}
                disabled={atStart}
                aria-label="Scroll left"
                className="rounded-full bg-raised p-1.5 text-ink-soft transition enabled:hover:bg-highlight enabled:hover:text-ink disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => page(1)}
                disabled={atEnd}
                aria-label="Scroll right"
                className="rounded-full bg-raised p-1.5 text-ink-soft transition enabled:hover:bg-highlight enabled:hover:text-ink disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        }
      />
      <div
        ref={scroller}
        onScroll={onScroll}
        className="-mx-3 flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-40 shrink-0 p-3 sm:w-44">
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
