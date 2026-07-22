"use client";

import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import PlayerBar from "@/components/player/PlayerBar";
import QueuePanel from "@/components/player/QueuePanel";
import NowPlaying from "@/components/player/NowPlaying";
import AddToPlaylistModal from "@/components/library/AddToPlaylistModal";
import LoginPromptModal from "@/components/modals/LoginPromptModal";
import UpgradePromptModal from "@/components/modals/UpgradePromptModal";
import Toaster from "@/components/ui/Toaster";
import { useUi } from "@/stores/ui";

/** Spotify-style chrome: sidebar + rounded main panel + bottom player. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const queuePanelOpen = useUi((s) => s.queuePanelOpen);
  const bare = pathname === "/login" || pathname === "/register";

  if (bare) {
    return (
      <div className="flex h-dvh flex-col overflow-y-auto bg-page">
        {children}
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col p-2 lg:pl-2">
          <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-panel bg-elev">
            <TopBar />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="px-4 pb-28 pt-4 sm:px-6">{children}</div>
            </div>
          </main>
        </div>
        {queuePanelOpen && <QueuePanel />}
      </div>

      <PlayerBar />
      <MobileNav />

      <NowPlaying />
      <LoginPromptModal />
      <UpgradePromptModal />
      <AddToPlaylistModal />
      <Toaster />
    </div>
  );
}
