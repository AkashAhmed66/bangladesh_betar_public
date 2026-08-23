import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/watch-live-channels/${encoded}`, canonicalPath: `/watch/live/${encoded}`, portal: "watch", contentLabel: "Live video channel", fallbackTitle: "Bangladesh Betar Live TV" });
}

export default function WatchLiveLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
