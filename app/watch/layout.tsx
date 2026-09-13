"use client";

import { usePathname } from "next/navigation";
import PortalFooter from "@/components/portal/PortalFooter";

export default function WatchLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isClips = pathname === "/watch/clips" || pathname.startsWith("/watch/clips/");

  if (isClips) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-full bg-elev">
      <div className="min-h-[60vh]">{children}</div>
      <PortalFooter portal="watch" />
    </div>
  );
}
