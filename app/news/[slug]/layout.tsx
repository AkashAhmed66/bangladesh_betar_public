import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const encoded = encodeURIComponent(slug);
  return contentMetadata({ apiPath: `/news/${encoded}`, canonicalPath: `/news/${encoded}`, portal: "news", contentLabel: "News article", fallbackTitle: "Bangladesh Betar News" });
}

export default function NewsStoryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
