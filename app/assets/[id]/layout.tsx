import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/assets/${encoded}`, canonicalPath: `/assets/${encoded}`, portal: "listen", contentLabel: "Archive recording", fallbackTitle: "Bangladesh Betar recording" });
}

export default function AssetLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
