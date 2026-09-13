import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/live-channels/${encoded}`, canonicalPath: `/live/${encoded}`, portal: "listen", contentLabel: "Live radio channel", fallbackTitle: "Bangladesh Betar Live Radio" });
}

export default function LiveChannelLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
