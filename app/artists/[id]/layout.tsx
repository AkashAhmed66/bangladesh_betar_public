import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/artists/${encoded}`, canonicalPath: `/artists/${encoded}`, portal: "listen", contentLabel: "Artist profile", fallbackTitle: "Bangladesh Betar artist" });
}

export default function ArtistLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
