"use client";

import { RadioTower } from "lucide-react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { BRAND } from "@/config/theme";
import { useUi } from "@/stores/ui";

export default function LoginPromptModal() {
  const { loginPromptOpen, loginPromptMessage, closeLoginPrompt } = useUi();

  return (
    <Modal open={loginPromptOpen} onClose={closeLoginPrompt}>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent/12">
          <RadioTower className="size-7 text-accent" />
        </span>
        <div>
          <h3 className="font-display text-xl font-bold">Join {BRAND.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {loginPromptMessage ?? "Sign in to unlock your library, favourites and personalised recommendations."}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Link
            href="/login"
            onClick={closeLoginPrompt}
            className="w-full rounded-full bg-accent py-2.5 text-sm font-bold text-accent-fg transition hover:bg-accent-hover"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            onClick={closeLoginPrompt}
            className="w-full rounded-full border border-edge-strong py-2.5 text-sm font-bold transition hover:border-ink"
          >
            Create a free account
          </Link>
        </div>
        <button onClick={closeLoginPrompt} className="text-xs font-semibold text-ink-mute transition hover:text-ink">
          Keep browsing as guest
        </button>
      </div>
    </Modal>
  );
}
