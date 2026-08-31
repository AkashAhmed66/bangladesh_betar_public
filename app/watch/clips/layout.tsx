import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clips · Betar Watch",
  description: "Short vertical video clips from Bangladesh Betar — scroll through exclusive original shorts.",
};

/**
 * Clips layout — fullscreen immersive experience.
 * Deliberately does NOT render the PortalHeader, PortalFooter, or AppShell.
 * The root layout only wraps with <html> and <body>, so this is the only wrapper for /watch/clips.
 */
export default function ClipsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
