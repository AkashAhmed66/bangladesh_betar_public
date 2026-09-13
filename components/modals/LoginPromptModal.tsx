"use client";

import { RadioTower } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { BRAND } from "@/config/theme";
import { useUi } from "@/stores/ui";
import { useTranslation } from "@/lib/i18n";

export default function LoginPromptModal() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { loginPromptOpen, loginPromptMessage, closeLoginPrompt } = useUi();

  return (
    <Modal open={loginPromptOpen} onClose={closeLoginPrompt}>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent/12">
          <RadioTower className="size-7 text-accent" />
        </span>
        <div>
          <h3 className="font-display text-xl font-bold">{t("prompts.join", { brand: BRAND.name })}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {loginPromptMessage ?? t("prompts.loginDefault")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Link
            href={`/login?next=${encodeURIComponent(pathname)}`}
            onClick={closeLoginPrompt}
            className="w-full rounded-full bg-accent py-2.5 text-sm font-bold text-accent-fg transition hover:bg-accent-hover"
          >
            {t("shell.signIn")}
          </Link>
          <Link
            href="/register"
            onClick={closeLoginPrompt}
            className="w-full rounded-full border border-edge-strong py-2.5 text-sm font-bold transition hover:border-ink"
          >
            {t("prompts.createFreeAccount")}
          </Link>
        </div>
        <button onClick={closeLoginPrompt} className="text-xs font-semibold text-ink-mute transition hover:text-ink">
          {t("prompts.browseAsGuest")}
        </button>
      </div>
    </Modal>
  );
}
