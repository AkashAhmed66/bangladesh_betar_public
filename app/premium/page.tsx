"use client";

import { BadgeCheck, Check, Crown, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { ApiError, post } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { usePlans, useSubscription } from "@/lib/hooks";
import type { Plan } from "@/lib/types";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

const METHODS = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "card", label: "Card" },
] as const;

function featureList(plan: Plan): string[] {
  const f = plan.features ?? {};
  const isPremium = plan.code === "premium";
  return [
    isPremium ? "Full-length premium collection" : "Full free catalogue",
    f["ads"] ? "Ad-supported listening" : "Ad-free listening",
    `Audio quality up to ${f["max_quality_kbps"] ?? 128} kbps`,
    f["skips_per_hour"] != null ? `${f["skips_per_hour"]} skips per hour` : "Unlimited skips",
    ...(f["offline_downloads"] ? ["Offline downloads (mobile)"] : []),
    ...(f["equalizer"] ? ["Equalizer & advanced playback"] : []),
  ];
}

export default function PremiumPage() {
  const { data: plans } = usePlans();
  const { data: sub, mutate: refreshSub } = useSubscription();
  const token = useAuth((s) => s.token);
  const refreshMe = useAuth((s) => s.refreshMe);
  const { openLoginPrompt, toast } = useUi();

  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [method, setMethod] = useState<(typeof METHODS)[number]["value"]>("bkash");
  const [promo, setPromo] = useState("");
  const [trial, setTrial] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPremium = sub?.entitlements.is_premium ?? false;

  const subscribe = async () => {
    if (!checkoutPlan) return;
    setBusy(true);
    setError(null);
    try {
      const res = await post<{ message: string }>("/me/subscription/subscribe", {
        plan_code: checkoutPlan.code,
        billing_cycle: cycle,
        method,
        promo_code: promo || undefined,
        start_trial: trial,
      });
      toast(res.message, "success");
      setCheckoutPlan(null);
      await Promise.all([refreshSub(), refreshMe()]);
    } catch (err) {
      setError(err instanceof ApiError ? err.firstError : "Payment failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-panel border border-premium/20 bg-raised p-10 text-center">
        <div
          aria-hidden
          className="ambient-drift pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--premium), transparent 70%)" }}
        />
        <Crown className="relative mx-auto size-10 text-premium" />
        <h1 className="relative mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
          Listen without limits
        </h1>
        <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
          Unlock the full archive — premium collections, ad-free playback, higher quality and unlimited skips.
          Support the preservation of a century of Bangladeshi radio.
        </p>
        {isPremium && (
          <p className="relative mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-premium/15 px-5 py-2 text-sm font-bold text-premium">
            <BadgeCheck className="size-4" /> You are a Premium member
          </p>
        )}
      </section>

      {/* Billing toggle */}
      <div className="mx-auto flex gap-1 rounded-full bg-raised p-1">
        {(["monthly", "annual"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            className={`rounded-full px-6 py-2 text-sm font-bold capitalize transition ${
              cycle === c ? "bg-ink text-page" : "text-ink-mute hover:text-ink"
            }`}
          >
            {c}
            {c === "annual" && <span className="ml-1.5 text-[10px] font-bold uppercase text-accent">Save more</span>}
          </button>
        ))}
      </div>

      {/* Plans */}
      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
        {(plans?.data ?? []).map((plan) => {
          const premium = plan.code === "premium";
          const price = cycle === "annual" ? plan.price_annual : plan.price_monthly;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col gap-5 rounded-panel border p-7 ${
                premium ? "border-premium/40 bg-gradient-to-b from-premium/10 to-raised" : "border-edge bg-raised"
              }`}
            >
              {premium && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-premium px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-premium-fg">
                  <Sparkles className="size-3" /> Most popular
                </span>
              )}
              <div>
                <h2 className="font-display text-xl font-bold">{plan.name}</h2>
                {plan.description && <p className="mt-1 text-xs text-ink-soft">{plan.description}</p>}
              </div>
              <p className="font-display text-4xl font-bold">
                {price === 0 ? "Free" : formatMoney(price, plan.currency)}
                {price > 0 && (
                  <span className="text-sm font-normal text-ink-mute">/{cycle === "annual" ? "year" : "month"}</span>
                )}
              </p>
              <ul className="flex flex-col gap-2.5">
                {featureList(plan).map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <Check className={`size-4 shrink-0 ${premium ? "text-premium" : "text-accent"}`} /> {feat}
                  </li>
                ))}
              </ul>
              <div className="flex-1" />
              {premium ? (
                <button
                  disabled={isPremium}
                  onClick={() => {
                    if (!token) {
                      openLoginPrompt("Sign in to upgrade to Premium.");
                      return;
                    }
                    setTrial(false);
                    setError(null);
                    setCheckoutPlan(plan);
                  }}
                  className="rounded-full bg-premium py-3 text-sm font-bold text-premium-fg transition enabled:hover:scale-[1.02] disabled:opacity-50"
                >
                  {isPremium ? "Current plan" : `Get Premium ${cycle}`}
                </button>
              ) : (
                <p className="rounded-full border border-edge py-3 text-center text-sm font-bold text-ink-mute">
                  {isPremium ? "Included" : "Your current plan"}
                </p>
              )}
              {premium && !isPremium && plan.trial_days > 0 && (
                <button
                  onClick={() => {
                    if (!token) {
                      openLoginPrompt("Sign in to start your free trial.");
                      return;
                    }
                    setTrial(true);
                    setError(null);
                    setCheckoutPlan(plan);
                  }}
                  className="-mt-2 text-center text-xs font-bold text-premium hover:underline"
                >
                  or start a {plan.trial_days}-day free trial
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Checkout modal */}
      <Modal open={checkoutPlan !== null} onClose={() => setCheckoutPlan(null)} title={trial ? "Start free trial" : "Checkout"}>
        {checkoutPlan && (
          <div className="flex flex-col gap-4">
            <div className="rounded-card bg-raised p-4">
              <p className="text-sm font-bold">
                {checkoutPlan.name} · <span className="capitalize">{cycle}</span>
              </p>
              <p className="mt-1 font-display text-2xl font-bold">
                {trial
                  ? `Free for ${checkoutPlan.trial_days} days`
                  : formatMoney(cycle === "annual" ? checkoutPlan.price_annual : checkoutPlan.price_monthly, checkoutPlan.currency)}
              </p>
              {trial && <p className="mt-1 text-xs text-ink-mute">No charge today. Cancel any time before the trial ends.</p>}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Payment method</p>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMethod(m.value)}
                    className={`rounded-card border px-4 py-2.5 text-sm font-bold transition ${
                      method === m.value ? "border-accent bg-accent/10 text-accent" : "border-edge-strong text-ink-soft hover:border-ink"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {!trial && (
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                placeholder="Promo code (try BETAR50)"
                className="rounded-card border border-edge-strong bg-raised px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-mute focus:border-accent"
              />
            )}

            {error && <p className="rounded-card bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</p>}

            <button
              onClick={subscribe}
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-full bg-premium py-3 text-sm font-bold text-premium-fg transition enabled:hover:scale-[1.02] disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {trial ? "Start trial" : "Confirm & pay"}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-ink-mute">
              Demo environment — the payment gateway is simulated. No real charge occurs.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
