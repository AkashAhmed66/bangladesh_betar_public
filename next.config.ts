import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev indicator badge sits bottom-left, exactly over the player bar.
  devIndicators: false,
  // Emit a self-contained server bundle (.next/standalone) for a tiny Docker
  // image. Does not affect `next start` — the manual production flow still works.
  output: "standalone",
  // Sibling projects share the parent folder; pin the root so Turbopack
  // never mis-infers the workspace.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
