"use client";

import { Share2 } from "lucide-react";
import { useUi } from "@/stores/ui";
import { useTranslation } from "@/lib/i18n";

interface ShareButtonProps {
  title: string;
  text?: string;
  /** Optional explicit URL; defaults to the current page. */
  url?: string;
  className?: string;
}

/**
 * Share control: uses the native share sheet where available (mobile / PWA),
 * and falls back to copying the link to the clipboard with a toast.
 */
export default function ShareButton({ title, text, url, className = "" }: ShareButtonProps) {
  const { t } = useTranslation();
  const toast = useUi((s) => s.toast);

  const share = async () => {
    const link = url ?? (typeof window !== "undefined" ? window.location.href : "");
    if (!link) return;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: text ?? title, url: link });
      } catch {
        // user dismissed the share sheet — nothing to do
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast(t("actions.linkCopied"), "success");
    } catch {
      toast(t("actions.copyFailed"), "error");
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={t("actions.share")}
      title={t("actions.share")}
      className={`flex size-11 items-center justify-center rounded-full border border-edge-strong text-ink-soft transition hover:scale-[1.03] hover:border-ink hover:text-ink ${className}`}
    >
      <Share2 className="size-5" />
    </button>
  );
}
