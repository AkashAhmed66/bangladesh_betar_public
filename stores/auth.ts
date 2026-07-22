"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, post, put, setTokenGetter } from "@/lib/api";
import type { Entitlements, TokenResponse, User } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: User | null;
  entitlements: Entitlements | null;
  hydrated: boolean;

  setSession: (res: TokenResponse) => void;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, "name" | "phone" | "locale" | "preferences">>) => Promise<void>;
}

/** Free-tier defaults applied to guests until the server says otherwise. */
export const GUEST_ENTITLEMENTS: Entitlements = {
  plan: "free",
  is_premium: false,
  ads_enabled: true,
  max_quality_kbps: 128,
  skips_per_hour: 6,
  offline_downloads: false,
  equalizer: false,
  premium_content_access: "preview",
  preview_seconds: 90,
};

export const useAuth = create<AuthState>()(
  persist(
    (set, getState) => ({
      token: null,
      user: null,
      entitlements: null,
      hydrated: false,

      setSession: (res) => {
        set({ token: res.token, user: res.user });
        void getState().refreshMe();
      },

      refreshMe: async () => {
        if (!getState().token) return;
        try {
          const res = await get<{ data: User }>("/auth/me");
          set({ user: res.data, entitlements: res.data.entitlements ?? null });
        } catch (e) {
          // Token revoked/expired — drop the session quietly.
          if ((e as { status?: number }).status === 401) {
            set({ token: null, user: null, entitlements: null });
          }
        }
      },

      logout: async () => {
        try {
          await post("/auth/logout");
        } catch {
          // best-effort; clear locally regardless
        }
        set({ token: null, user: null, entitlements: null });
      },

      updateProfile: async (data) => {
        await put("/auth/profile", data);
        await getState().refreshMe();
      },
    }),
    {
      name: "betar.auth",
      partialize: (s) => ({ token: s.token, user: s.user, entitlements: s.entitlements }),
      onRehydrateStorage: () => () => {
        // Defer until module evaluation finishes so the store reference and
        // the API token getter are both wired before we touch the network.
        setTimeout(() => {
          useAuth.setState({ hydrated: true });
          void useAuth.getState().refreshMe();
        }, 0);
      },
    },
  ),
);

// Give the API client access to the token without importing the store there.
setTokenGetter(() => useAuth.getState().token);

/** Entitlements to enforce right now (guest defaults until known). */
export function currentEntitlements(): Entitlements {
  return useAuth.getState().entitlements ?? GUEST_ENTITLEMENTS;
}
