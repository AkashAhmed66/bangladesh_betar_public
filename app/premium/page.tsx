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
import { localizedText, useTranslation } from "@/lib/i18n";

const METHODS = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "card", label: "Card" },
] as const;

function featureList(plan: Plan, t: (key: string, params?: Record<string, string | number>) => string): string[] {
  const f = plan.features ?? {};
  const isPremium = plan.code === "premium";
  return [
    isPremium ? t("premiumPage.premiumCollection") : t("premiumPage.freeCatalogue"),
    f["ads"] ? t("premiumPage.adSupported") : t("premiumPage.adFree"),
    t("premiumPage.quality", { quality: Number(f["max_quality_kbps"] ?? 128) }),
    f["skips_per_hour"] != null ? t("premiumPage.skips", { count: Number(f["skips_per_hour"]) }) : t("premiumPage.unlimitedSkips"),
    ...(f["offline_downloads"] ? [t("premiumPage.offline")] : []),
    ...(f["equalizer"] ? [t("premiumPage.equalizer")] : []),
  ];
}

export default function PremiumPage() {
  const { locale, t } = useTranslation();
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
      setError(err instanceof ApiError ? err.firstError : t("premiumPage.paymentFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-panel border border-premium/20 bg-raised p-6 text-center sm:p-10">
        <div
          aria-hidden
          className="ambient-drift pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--premium), transparent 70%)" }}
        />
        <Crown className="relative mx-auto size-10 text-premium" />
        <h1 className="relative mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
          {t("premiumPage.title")}
        </h1>
        <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
          {t("premiumPage.description")}
        </p>
        {isPremium && (
          <p className="relative mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-premium/15 px-5 py-2 text-sm font-bold text-premium">
            <BadgeCheck className="size-4" /> {t("premiumPage.member")}
          </p>
        )}
      </section>

      {/* Billing toggle */}
      <div className="mx-auto flex max-w-full gap-1 rounded-full bg-raised p-1">
        {(["monthly", "annual"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCycle(c)}
            className={`min-h-11 min-w-0 flex-1 rounded-full px-4 py-2 text-sm font-bold capitalize transition sm:flex-none sm:px-6 ${
              cycle === c ? "bg-ink text-page" : "text-ink-mute hover:text-ink"
            }`}
          >
            {t(`premiumPage.${c}`)}
            {c === "annual" && <span className="ml-1.5 text-[10px] font-bold uppercase text-accent">{t("premiumPage.saveMore")}</span>}
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
              className={`relative flex flex-col gap-5 rounded-panel border p-5 sm:p-7 ${
                premium ? "border-premium/40 bg-gradient-to-b from-premium/10 to-raised" : "border-edge bg-raised"
              }`}
            >
              {premium && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-premium px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-premium-fg">
                  <Sparkles className="size-3" /> {t("premiumPage.mostPopular")}
                </span>
              )}
              <div>
                <h2 className="font-display text-xl font-bold">{localizedText(plan as unknown as Record<string, unknown>, "name", locale)}</h2>
                {localizedText(plan as unknown as Record<string, unknown>, "description", locale) && <p className="mt-1 text-xs text-ink-soft">{localizedText(plan as unknown as Record<string, unknown>, "description", locale)}</p>}
              </div>
              <p className="font-display text-4xl font-bold">
                {price === 0 ? t("premiumPage.free") : formatMoney(price, plan.currency, locale)}
                {price > 0 && (
                  <span className="text-sm font-normal text-ink-mute">/{cycle === "annual" ? t("premiumPage.year") : t("premiumPage.month")}</span>
                )}
              </p>
              <ul className="flex flex-col gap-2.5">
                {featureList(plan, t).map((feat) => (
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
                      openLoginPrompt(t("premiumPage.loginUpgrade"));
                      return;
                    }
                    setTrial(false);
                    setError(null);
                    setCheckoutPlan(plan);
                  }}
                  className="rounded-full bg-premium py-3 text-sm font-bold text-premium-fg transition enabled:hover:scale-[1.02] disabled:opacity-50"
                >
                  {isPremium ? t("premiumPage.current") : t("premiumPage.getPremium", { cycle: t(`premiumPage.${cycle}`) })}
                </button>
              ) : (
                <p className="rounded-full border border-edge py-3 text-center text-sm font-bold text-ink-mute">
                  {isPremium ? t("premiumPage.included") : t("premiumPage.yourCurrent")}
                </p>
              )}
              {premium && !isPremium && plan.trial_days > 0 && (
                <button
                  onClick={() => {
                    if (!token) {
                      openLoginPrompt(t("premiumPage.loginTrial"));
                      return;
                    }
                    setTrial(true);
                    setError(null);
                    setCheckoutPlan(plan);
                  }}
                  className="-mt-2 text-center text-xs font-bold text-premium hover:underline"
                >
                  {t("premiumPage.trialLink", { days: plan.trial_days })}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Checkout modal */}
      <Modal open={checkoutPlan !== null} onClose={() => setCheckoutPlan(null)} title={trial ? t("premiumPage.trialTitle") : t("premiumPage.checkout")}>
        {checkoutPlan && (
          <div className="flex flex-col gap-4">
            <div className="rounded-card bg-raised p-4">
              <p className="text-sm font-bold">
                {checkoutPlan.name} · <span className="capitalize">{cycle}</span>
              </p>
              <p className="mt-1 font-display text-2xl font-bold">
                {trial
                  ? t("premiumPage.freeDays", { days: checkoutPlan.trial_days })
                  : formatMoney(cycle === "annual" ? checkoutPlan.price_annual : checkoutPlan.price_monthly, checkoutPlan.currency, locale)}
              </p>
              {trial && <p className="mt-1 text-xs text-ink-mute">{t("premiumPage.noCharge")}</p>}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">{t("premiumPage.paymentMethod")}</p>
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
                placeholder={t("premiumPage.promo")}
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
              {trial ? t("premiumPage.startTrial") : t("premiumPage.confirmPay")}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-ink-mute">
              {t("premiumPage.demo")}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
