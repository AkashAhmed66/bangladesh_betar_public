"use client";

import { Check, Crown } from "lucide-react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { useUi } from "@/stores/ui";
import { useTranslation } from "@/lib/i18n";

export default function UpgradePromptModal() {
  const { t } = useTranslation();
  const { upgradePromptOpen, upgradeReason, closeUpgradePrompt } = useUi();
  const reason = upgradeReason ?? { title: t("prompts.previewTitle"), body: t("prompts.previewBody") };
  const perks = ["premiumFullRecordings", "premiumQueue", "premiumSeek", "premiumAdFree", "premiumQuality", "premiumSkips"];

  return (
    <Modal open={upgradePromptOpen} onClose={closeUpgradePrompt}>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-premium/12">
          <Crown className="size-7 text-premium" />
        </span>
        <div>
          <h3 className="font-display text-xl font-bold">{reason.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {reason.body}
          </p>
        </div>
        <ul className="w-full space-y-2 rounded-card bg-raised p-4 text-left">
          {perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2.5 text-sm text-ink-soft">
              <Check className="size-4 shrink-0 text-premium" /> {t(`prompts.${perk}`)}
            </li>
          ))}
        </ul>
        <Link
          href="/premium"
          onClick={closeUpgradePrompt}
          className="w-full rounded-full bg-premium py-2.5 text-sm font-bold text-premium-fg transition hover:scale-[1.02]"
        >
          {t("prompts.explorePremium")}
        </Link>
        <button onClick={closeUpgradePrompt} className="text-xs font-semibold text-ink-mute transition hover:text-ink">
          {t("prompts.maybeLater")}
        </button>
      </div>
    </Modal>
  );
}
