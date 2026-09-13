import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/podcasts/${encoded}`, canonicalPath: `/podcasts/${encoded}`, portal: "listen", contentLabel: "Podcast", fallbackTitle: "Bangladesh Betar podcast" });
}

export default function PodcastLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
