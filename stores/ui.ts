"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerTrack } from "./player";

export interface Toast {
  id: number;
  message: string;
  kind: "info" | "success" | "error" | "premium";
}

interface UiState {
  locale: "en" | "bn";
  setLocale: (l: "en" | "bn") => void;

  loginPromptOpen: boolean;
  loginPromptMessage: string | null;
  openLoginPrompt: (message?: string) => void;
  closeLoginPrompt: () => void;

  upgradePromptOpen: boolean;
  openUpgradePrompt: () => void;
  closeUpgradePrompt: () => void;

  addToPlaylistTrack: PlayerTrack | null;
  openAddToPlaylist: (track: PlayerTrack) => void;
  closeAddToPlaylist: () => void;

  queuePanelOpen: boolean;
  toggleQueuePanel: () => void;
  nowPlayingOpen: boolean;
  setNowPlayingOpen: (open: boolean) => void;

  toasts: Toast[];
  toast: (message: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
}

let toastSeq = 1;

export const useUi = create<UiState>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),

      loginPromptOpen: false,
      loginPromptMessage: null,
      openLoginPrompt: (message) => set({ loginPromptOpen: true, loginPromptMessage: message ?? null }),
      closeLoginPrompt: () => set({ loginPromptOpen: false, loginPromptMessage: null }),

      upgradePromptOpen: false,
      openUpgradePrompt: () => set({ upgradePromptOpen: true }),
      closeUpgradePrompt: () => set({ upgradePromptOpen: false }),

      addToPlaylistTrack: null,
      openAddToPlaylist: (track) => set({ addToPlaylistTrack: track }),
      closeAddToPlaylist: () => set({ addToPlaylistTrack: null }),

      queuePanelOpen: false,
      toggleQueuePanel: () => set((s) => ({ queuePanelOpen: !s.queuePanelOpen, nowPlayingOpen: false })),
      nowPlayingOpen: false,
      setNowPlayingOpen: (nowPlayingOpen) => set({ nowPlayingOpen, queuePanelOpen: false }),

      toasts: [],
      toast: (message, kind = "info") => {
        const id = toastSeq++;
        set((s) => ({ toasts: [...s.toasts.slice(-3), { id, message, kind }] }));
        setTimeout(() => get().dismissToast(id), 4200);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    { name: "betar.ui", partialize: (s) => ({ locale: s.locale }) },
  ),
);
