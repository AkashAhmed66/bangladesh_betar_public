"use client";

import { Moon, Sun } from "lucide-react";
import { useUi } from "@/stores/ui";
import { useTranslation } from "@/lib/i18n";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const toggleTheme = useUi((state) => state.toggleTheme);
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("shell.toggleTheme")}
      title={t("shell.toggleTheme")}
      className={`flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-edge bg-raised text-xs font-bold text-ink-soft transition hover:border-edge-strong hover:bg-highlight hover:text-ink ${
        compact ? "size-10 p-0" : "px-3 py-1.5"
      }`}
    >
      <Sun className="theme-action-light size-4" aria-hidden="true" />
      <Moon className="theme-action-dark size-4" aria-hidden="true" />
      {!compact && (
        <>
          <span className="theme-action-light">{t("shell.light")}</span>
          <span className="theme-action-dark">{t("shell.dark")}</span>
        </>
      )}
    </button>
  );
}
