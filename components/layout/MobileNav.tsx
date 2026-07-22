"use client";

import { Compass, Home, Library, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", icon: Home, label: "Home", exact: true },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/browse", icon: Compass, label: "Browse" },
  { href: "/library", icon: Library, label: "Library" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around border-t border-edge bg-sunken/95 py-1.5 backdrop-blur lg:hidden">
      {TABS.map(({ href, icon: Icon, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 text-[10px] font-semibold ${
              active ? "text-ink" : "text-ink-mute"
            }`}
          >
            <Icon className={`size-5 ${active ? "text-accent" : ""}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
