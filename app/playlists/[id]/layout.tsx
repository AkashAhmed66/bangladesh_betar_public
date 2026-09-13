import type { Metadata } from "next";
import { contentMetadata } from "@/lib/socialMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const encoded = encodeURIComponent(id);
  return contentMetadata({ apiPath: `/playlists/${encoded}`, canonicalPath: `/playlists/${encoded}`, portal: "listen", contentLabel: "Playlist", fallbackTitle: "Bangladesh Betar playlist" });
}

export default function PlaylistLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
