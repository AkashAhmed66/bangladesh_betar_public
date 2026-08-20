"use client";

import { Compass, Home, Library, Radio, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", icon: Home, label: "Home", exact: true },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/live", icon: Radio, label: "Live" },
  { href: "/browse", icon: Compass, label: "Browse" },
  { href: "/library", icon: Library, label: "Library" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center border-t border-edge bg-sunken/95 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur lg:hidden" aria-label="Primary navigation">
      {TABS.map(({ href, icon: Icon, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-semibold ${
              active ? "text-ink" : "text-ink-mute"
            }`}
          >
            <Icon className={`size-5 ${active ? "text-[var(--portal-color)]" : ""}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
