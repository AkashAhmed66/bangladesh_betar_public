"use client";

import Link from "next/link";

interface ArtistRef {
  id: number;
  name: string;
}

/**
 * Renders a comma-separated list of artist names, each linking to the artist's
 * profile. Falls back to plain text (e.g. names without ids) when no linkable
 * artists are available.
 */
export default function ArtistLinks({
  artists,
  fallback,
  className = "",
}: {
  artists?: ArtistRef[] | null;
  fallback?: React.ReactNode;
  className?: string;
}) {
  if (!artists || artists.length === 0) {
    return fallback != null ? <span className={className}>{fallback}</span> : null;
  }

  return (
    <span className={className}>
      {artists.map((a, i) => (
        <span key={a.id}>
          {i > 0 && ", "}
          <Link href={`/artists/${a.id}`} className="hover:text-accent hover:underline">
            {a.name}
          </Link>
        </span>
      ))}
    </span>
  );
}
