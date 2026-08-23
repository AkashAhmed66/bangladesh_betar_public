import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Betar Watch",
  description: "Original programmes, documentaries and live public video from Bangladesh Betar.",
  openGraph: {
    type: "website",
    title: "Betar Watch",
    description: "Original programmes, documentaries and live public video from Bangladesh Betar.",
    images: [{ url: "/editorial/watch-hero.png", alt: "Bangladesh Betar Watch" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Betar Watch",
    description: "Original programmes, documentaries and live public video from Bangladesh Betar.",
    images: ["/editorial/watch-hero.png"],
  },
};

export default function WatchLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
