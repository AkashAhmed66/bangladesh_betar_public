import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const encoded = encodeURIComponent(slug);
  return contentMetadata({ apiPath: `/watch/${encoded}/preview`, canonicalPath: `/watch/${encoded}`, portal: "watch", contentLabel: "Watch programme", fallbackTitle: "Bangladesh Betar Watch" });
}

export default function WatchShowLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
