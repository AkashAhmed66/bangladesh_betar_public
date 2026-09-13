import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/programmes/${encoded}`, canonicalPath: `/programmes/${encoded}`, portal: "listen", contentLabel: "Radio programme", fallbackTitle: "Bangladesh Betar programme" });
}

export default function ProgrammeLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
