"use client";

import { useEffect } from "react";
import { useUi, type ColorTheme } from "@/stores/ui";

const THEME_COLORS: Record<ColorTheme, string> = {
  light: "#edf2ef",
  dark: "#070708",
};

/** Keeps the persisted preference, document palette, and browser chrome in sync. */
export default function ThemeController() {
  const theme = useUi((state) => state.theme);
  const setTheme = useUi((state) => state.setTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", THEME_COLORS[theme]));
  }, [theme]);

  useEffect(() => {
    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key !== "betar.ui" || !event.newValue) return;

      try {
        const value = JSON.parse(event.newValue) as { state?: { theme?: unknown } };
        const nextTheme = value.state?.theme;
        if (
          (nextTheme === "light" || nextTheme === "dark") &&
          useUi.getState().theme !== nextTheme
        ) {
          setTheme(nextTheme);
        }
      } catch {
        // Ignore malformed storage written by extensions or an older app build.
      }
    };

    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, [setTheme]);

  return null;
}
