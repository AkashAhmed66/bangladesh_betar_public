"use client";

import { AlertCircle, CheckCircle2, Crown, Info, X } from "lucide-react";
import { useUi } from "@/stores/ui";

const ICONS = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
  premium: Crown,
} as const;

const STYLES = {
  info: "border-edge-strong",
  success: "border-accent/40",
  error: "border-danger/50",
  premium: "border-premium/50",
} as const;

const ICON_STYLES = {
  info: "text-ink-soft",
  success: "text-accent",
  error: "text-danger",
  premium: "text-premium",
} as const;

export default function Toaster() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-[calc(var(--player-h)+1rem)] left-1/2 z-130 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = ICONS[t.kind];
        return (
          <div
            key={t.id}
            className={`fade-up pointer-events-auto flex w-full items-center gap-3 rounded-panel border ${STYLES[t.kind]} bg-raised/95 px-4 py-3 text-sm shadow-xl shadow-black/50 backdrop-blur`}
          >
            <Icon className={`size-4 shrink-0 ${ICON_STYLES[t.kind]}`} />
            <p className="flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-ink-mute hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
