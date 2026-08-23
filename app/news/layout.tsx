import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Betar News",
  description: "Trusted public-service journalism and the latest reporting from Bangladesh Betar.",
  openGraph: {
    type: "website",
    title: "Betar News",
    description: "Trusted public-service journalism and the latest reporting from Bangladesh Betar.",
    images: [{ url: "/editorial/news-hero.png", alt: "Bangladesh Betar News" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Betar News",
    description: "Trusted public-service journalism and the latest reporting from Bangladesh Betar.",
    images: ["/editorial/news-hero.png"],
  },
};

export default function NewsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
