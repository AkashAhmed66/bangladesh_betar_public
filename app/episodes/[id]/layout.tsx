import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/episodes/${encoded}`, canonicalPath: `/episodes/${encoded}`, portal: "listen", contentLabel: "Programme episode", fallbackTitle: "Bangladesh Betar episode" });
}

export default function EpisodeLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
