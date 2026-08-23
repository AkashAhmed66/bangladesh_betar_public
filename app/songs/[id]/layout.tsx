import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/songs/${encoded}`, canonicalPath: `/songs/${encoded}`, portal: "listen", contentLabel: "Song", fallbackTitle: "Bangladesh Betar song" });
}

export default function SongLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
