import type { Metadata } from "next";
import { headers } from "next/headers";

type Portal = "news" | "watch" | "listen";

type PreviewRecord = {
  title?: string | null;
  title_bn?: string | null;
  name?: string | null;
  name_bn?: string | null;
  session_title?: string | null;
  summary?: string | null;
  description?: string | null;
  bio?: string | null;
  image_url?: string | null;
  artwork_url?: string | null;
  cover_url?: string | null;
  photo_url?: string | null;
  channel?: { artwork_url?: string | null } | null;
};

interface ContentMetadataOptions {
  apiPath: string;
  canonicalPath: string;
  portal: Portal;
  contentLabel: string;
  fallbackTitle: string;
}

const PORTAL_FALLBACK_IMAGE: Record<Portal, string> = {
  news: "/editorial/news-hero.png",
  watch: "/editorial/watch-hero.png",
  listen: "/opengraph-image",
};

function cleanText(value: string | null | undefined, maxLength: number): string | null {
  if (!value) return null;
  const cleaned = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length <= maxLength ? cleaned : `${cleaned.slice(0, maxLength - 1).trimEnd()}…`;
}

function apiBases(): string[] {
  return [
    process.env.API_INTERNAL_BASE,
    process.env.NEXT_PUBLIC_API_BASE,
    `http://localhost:${process.env.NEXT_PUBLIC_API_PORT || "15000"}/api/v1`,
  ]
    .filter((value): value is string => Boolean(value && !value.includes("__RT_")))
    .map((value) => value.replace(/\/$/, ""))
    .filter((value, index, values) => values.indexOf(value) === index);
}

async function fetchPreview(apiPath: string): Promise<PreviewRecord | null> {
  for (const base of apiBases()) {
    try {
      const response = await fetch(`${base}${apiPath}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2500),
      });
      if (!response.ok) continue;
      const payload = await response.json() as { data?: PreviewRecord };
      if (payload.data) return payload.data;
    } catch {
      // Try the next configured API address, then use branded fallback tags.
    }
  }
  return null;
}

async function requestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host") || "localhost:15001";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}`;
}

function absoluteUrl(value: string, origin: string): string {
  try {
    return new URL(value, origin).toString();
  } catch {
    return new URL("/opengraph-image", origin).toString();
  }
}

function publicMediaUrl(value: string, requestOrigin: string): string {
  const resolved = absoluteUrl(value, requestOrigin);

  try {
    const image = new URL(resolved);
    const internalBase = process.env.API_INTERNAL_BASE ? new URL(process.env.API_INTERNAL_BASE) : null;
    const isInternal = image.hostname === "host.docker.internal"
      || image.hostname === "app"
      || (internalBase !== null && image.origin === internalBase.origin);

    if (!isInternal) return image.toString();

    const explicitPublicBase = process.env.NEXT_PUBLIC_API_BASE;
    const publicApi = explicitPublicBase && !explicitPublicBase.includes("__RT_")
      ? new URL(explicitPublicBase)
      : new URL(requestOrigin);

    if (!explicitPublicBase) publicApi.port = process.env.NEXT_PUBLIC_API_PORT || "15000";
    image.protocol = publicApi.protocol;
    image.host = publicApi.host;
    return image.toString();
  } catch {
    return absoluteUrl(PORTAL_FALLBACK_IMAGE.listen, requestOrigin);
  }
}

export async function contentMetadata({
  apiPath,
  canonicalPath,
  portal,
  contentLabel,
  fallbackTitle,
}: ContentMetadataOptions): Promise<Metadata> {
  const [record, origin] = await Promise.all([fetchPreview(apiPath), requestOrigin()]);
  const title = cleanText(record?.session_title || record?.title || record?.name || record?.title_bn || record?.name_bn, 100) || fallbackTitle;
  const description = cleanText(record?.summary || record?.description || record?.bio, 200)
    || `${contentLabel} from Bangladesh Betar's digital public-service archive.`;
  const rawImage = record?.image_url || record?.artwork_url || record?.cover_url || record?.photo_url || record?.channel?.artwork_url || PORTAL_FALLBACK_IMAGE[portal];
  const image = publicMediaUrl(rawImage, origin);
  const canonical = absoluteUrl(canonicalPath, origin);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: portal === "news" ? "article" : "website",
      title,
      description,
      url: canonical,
      siteName: "Bangladesh Betar",
      locale: "en_BD",
      alternateLocale: ["bn_BD"],
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
