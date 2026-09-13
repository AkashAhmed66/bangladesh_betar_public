import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/albums/${encoded}`, canonicalPath: `/albums/${encoded}`, portal: "listen", contentLabel: "Album", fallbackTitle: "Bangladesh Betar album" });
}

export default function AlbumLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
