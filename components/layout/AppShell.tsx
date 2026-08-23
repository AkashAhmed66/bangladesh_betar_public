"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
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
  const portal = portalForPath(pathname);
  const isListen = portal === "listen";
  const queuePanelOpen = useUi((s) => s.queuePanelOpen);
  const bare = pathname === "/login" || pathname === "/register";

  // Load the offline-downloads index once so download state is known app-wide.
  useEffect(() => {
    void useDownloads.getState().hydrate();
  }, []);

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
        <main className={`min-h-0 min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto bg-elev ${isListen ? "listen-scroll-region" : ""}`}>
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
