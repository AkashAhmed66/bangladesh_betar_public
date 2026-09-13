export type Portal = "news" | "watch" | "listen";

export function portalForPath(pathname: string): Portal {
  if (pathname === "/news" || pathname.startsWith("/news/")) return "news";
  if (
    pathname === "/watch" ||
    pathname.startsWith("/watch/") ||
    pathname === "/ott" ||
    pathname.startsWith("/ott/")
  ) {
    return "watch";
  }

  return "listen";
}
