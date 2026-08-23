import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/podcast-episodes/${encoded}`, canonicalPath: `/podcast-episodes/${encoded}`, portal: "listen", contentLabel: "Podcast episode", fallbackTitle: "Bangladesh Betar podcast episode" });
}

export default function PodcastEpisodeLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
