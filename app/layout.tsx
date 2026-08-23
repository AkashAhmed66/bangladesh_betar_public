import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { BRAND } from "@/config/theme";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const bangla = Hind_Siliguri({
  variable: "--font-bangla-face",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || "http://localhost:15001"),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Bangladesh Betar's digital public service for trusted news, original video and the national sound archive.",
  applicationName: "Bangladesh Betar",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bangladesh Betar",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg" }],
  },
  openGraph: {
    type: "website",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: "Bangladesh Betar's digital public service for trusted news, original video and the national sound archive.",
    siteName: BRAND.name,
    locale: "en_BD",
    alternateLocale: ["bn_BD"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: "Bangladesh Betar's digital public service for trusted news, original video and the national sound archive.",
  },
};

export const viewport: Viewport = {
  themeColor: "#18211d",
};

const themeBootScript = `
  (function () {
    var theme = "dark";
    try {
      var stored = window.localStorage.getItem("betar.ui");
      var parsed = stored ? JSON.parse(stored) : null;
      var saved = parsed && parsed.state && parsed.state.theme;
      if (saved === "light" || saved === "dark") theme = saved;
    } catch (_) {}
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${jakarta.variable} ${grotesk.variable} ${bangla.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="grain h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
