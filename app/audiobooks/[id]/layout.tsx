import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/audiobooks/${encoded}/preview`, canonicalPath: `/audiobooks/${encoded}`, portal: "listen", contentLabel: "Audio book", fallbackTitle: "Bangladesh Betar audio book" });
}

export default function AudioBookLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
