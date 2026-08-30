"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import MobileNav from "./MobileNav";
import PortalHeader from "./PortalHeader";
import PlayerBar from "@/components/player/PlayerBar";
import QueuePanel from "@/components/player/QueuePanel";
import NowPlaying from "@/components/player/NowPlaying";
import LiveDock from "@/components/live/LiveDock";
import AddToPlaylistModal from "@/components/library/AddToPlaylistModal";
import LoginPromptModal from "@/components/modals/LoginPromptModal";
import UpgradePromptModal from "@/components/modals/UpgradePromptModal";
import RegisterSW from "@/components/pwa/RegisterSW";
import Toaster from "@/components/ui/Toaster";
import ThemeController from "@/components/theme/ThemeController";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { portalForPath } from "@/lib/portal";
import { useDownloads } from "@/stores/downloads";
import { useUi } from "@/stores/ui";

/** Shared shell for News, Watch and Listen with one account and theme. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLElement>(null);
  const portal = portalForPath(pathname);
  const isListen = portal === "listen";
  const queuePanelOpen = useUi((s) => s.queuePanelOpen);
  const bare = pathname === "/login" || pathname === "/register";

  // Load the offline-downloads index once so download state is known app-wide.
  useEffect(() => {
    void useDownloads.getState().hydrate();
  }, []);

  // The document itself is never the app's scroll surface. Next's automatic
  // route scroll occasionally moves window.scrollY by the header height on
  // News routes, which visually carries both header rows above the viewport.
  // Keep the document anchored and let only the tagged <main> element scroll.
  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const anchorDocument = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0);
    };

    anchorDocument();
    window.addEventListener("scroll", anchorDocument, { passive: true });
    return () => {
      window.removeEventListener("scroll", anchorDocument);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  // Next preserves layouts between client-side navigations, which also means
  // this custom scroll container survives unless we reset it ourselves. A new
  // page must always begin at its top; otherwise stale scroll momentum can be
  // mistaken for a fresh user scroll by the header.
  useEffect(() => {
    const resetScrollSurfaces = () => {
      window.scrollTo(0, 0);
      scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    resetScrollSurfaces();
    const frame = window.requestAnimationFrame(resetScrollSurfaces);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  if (bare) {
    return (
      <div className="flex h-dvh flex-col overflow-y-auto bg-page">
        <ThemeController />
        <div className="fixed right-3 top-3 z-50 sm:right-5 sm:top-5">
          <ThemeToggle />
        </div>
        {children}
        <Toaster />
        <RegisterSW />
      </div>
    );
  }

  return (
    <div data-portal={portal} className="flex h-dvh w-full min-w-0 max-w-full flex-col overflow-hidden bg-page">
      <ThemeController />
      <PortalHeader />
      <div className="relative flex min-h-0 flex-1">
        <main
          ref={scrollContainerRef}
          data-app-scroll-container
          className={`min-h-0 min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto bg-elev ${isListen ? "listen-scroll-region" : ""}`}
        >
          <div className={isListen ? "mx-auto w-full max-w-[1540px] px-4 pb-10 pt-5 sm:px-7 sm:pb-14 sm:pt-7" : "min-h-full"}>
            {children}
          </div>
        </main>
        {isListen && queuePanelOpen && <QueuePanel />}
      </div>

      {isListen && <LiveDock />}
      {isListen && <PlayerBar />}
      {isListen && <MobileNav />}

      <NowPlaying />
      <LoginPromptModal />
      <UpgradePromptModal />
      <AddToPlaylistModal />
      <Toaster />
      <RegisterSW />
    </div>
  );
}
