"use client";

import { BadgeCheck, CreditCard, Crown, Loader2, Receipt, ShieldOff, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/Misc";
import { ApiError, post } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { usePayments, useSubscription } from "@/lib/hooks";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";
import { useTranslation } from "@/lib/i18n";

export default function AccountPage() {
  const { locale: uiLocale, t } = useTranslation();
  const { token, user, hydrated, updateProfile } = useAuth();
  const { data: sub, mutate: refreshSub } = useSubscription();
  const { data: payments } = usePayments();
  const toast = useUi((s) => s.toast);
  const setUiLocale = useUi((s) => s.setLocale);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locale, setLocale] = useState<"en" | "bn">("bn");
  const [optOut, setOptOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadedForUser, setLoadedForUser] = useState<number | null>(null);

  // Fill the form once per signed-in user (without clobbering later edits).
  if (user && loadedForUser !== user.id) {
    setLoadedForUser(user.id);
    setName(user.name);
    setPhone(user.phone ?? "");
    setLocale(user.locale);
    setOptOut(Boolean((user.preferences as { personalization_opt_out?: boolean } | null)?.personalization_opt_out));
  }

  if (hydrated && !token) {
    return (
      <EmptyState
        icon={<User className="size-10" />}
        title={t("accountPage.title")}
        subtitle={t("accountPage.signInDescription")}
        action={
          <Link href="/login" className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover">
            {t("auth.signIn")}
          </Link>
        }
      />
    );
  }

  const saveProfile = async () => {
    setBusy(true);
    try {
      await updateProfile({ name, phone: phone || null, locale });
      setUiLocale(locale);
      toast(t("accountPage.updated"), "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.firstError : t("accountPage.updateFailed"), "error");
    } finally {
      setBusy(false);
    }
  };

  const togglePersonalization = async () => {
    const next = !optOut;
    setOptOut(next);
    try {
      await post("/me/personalization/opt-out", { opt_out: next });
      toast(next ? t("accountPage.disabled") : t("accountPage.enabled"), "success");
    } catch {
      setOptOut(!next);
      toast(t("accountPage.preferenceFailed"), "error");
    }
  };

  const cancelSubscription = async () => {
    if (!confirm(t("accountPage.cancelConfirm"))) return;
    try {
      const res = await post<{ message: string }>("/me/subscription/cancel");
      toast(res.message, "success");
      void refreshSub();
    } catch (err) {
      toast(err instanceof ApiError ? err.firstError : t("accountPage.cancelFailed"), "error");
    }
  };

  const input =
    "w-full rounded-card border border-edge-strong bg-raised px-4 py-2.5 text-sm outline-none transition focus:border-accent";
  const subscription = sub?.subscription;
  const ent = sub?.entitlements;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{t("common.account")}</h1>

      {/* Profile */}
      <section className="rounded-panel border border-edge bg-raised/50 p-4 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <User className="size-5 text-accent" /> {t("accountPage.profile")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("accountPage.name")}
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("accountPage.phone")}
            <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01700000000" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("accountPage.email")}
            <input className={`${input} opacity-60`} value={user?.email ?? ""} disabled />
          </label>
          <div className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("accountPage.language")}
            <div className="flex gap-1 rounded-full bg-raised p-1">
              {(["bn", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`flex-1 rounded-full py-1.5 text-sm font-bold transition ${
                    locale === l ? "bg-ink text-page" : "text-ink-mute hover:text-ink"
                  }`}
                >
                  {l === "bn" ? t("listen.bangla") : t("listen.english")}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={togglePersonalization}
            className="flex items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-ink"
          >
            <ShieldOff className={`size-4 ${optOut ? "text-danger" : "text-ink-mute"}`} />
            {optOut ? t("accountPage.personalisationOff") : t("accountPage.personalisationOn")}
          </button>
          <button
            onClick={saveProfile}
            disabled={busy}
            className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" />} {t("accountPage.save")}
          </button>
        </div>
      </section>

      {/* Subscription */}
      <section className="rounded-panel border border-edge bg-raised/50 p-4 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Crown className="size-5 text-premium" /> {t("accountPage.subscription")}
        </h2>
        {ent?.is_premium && subscription ? (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm">
              <BadgeCheck className="size-4 text-premium" />
              <span className="font-bold capitalize">{subscription.plan} · {subscription.billing_cycle}</span>
              <span className="rounded-full bg-premium/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-premium">
                {subscription.status}
              </span>
            </p>
            <p className="text-sm text-ink-soft">
              {subscription.auto_renew
                ? t("accountPage.renews", { date: formatDate(subscription.ends_at, uiLocale) })
                : t("accountPage.activeUntil", { date: formatDate(subscription.ends_at, uiLocale) })}
              {subscription.trial_ends_at && ` · ${t("accountPage.trialEnds", { date: formatDate(subscription.trial_ends_at, uiLocale) })}`}
            </p>
            {subscription.auto_renew && (
              <button
                onClick={cancelSubscription}
                className="self-start rounded-full border border-edge-strong px-5 py-2 text-sm font-bold text-danger transition hover:border-danger"
              >
                {t("accountPage.cancel")}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-ink-soft">
              {t("accountPage.freePlan")}
              {ent ? ` ${t("accountPage.freeQuality", { quality: ent.max_quality_kbps })}` : "."}
            </p>
            <Link
              href="/premium"
              className="flex items-center gap-2 rounded-full bg-premium px-6 py-2 text-sm font-bold text-premium-fg transition hover:scale-105"
            >
              <Crown className="size-4" /> {t("accountPage.upgrade")}
            </Link>
          </div>
        )}
      </section>

      {/* Payments */}
      <section className="rounded-panel border border-edge bg-raised/50 p-4 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Receipt className="size-5 text-accent" /> {t("accountPage.payments")}
        </h2>
        {(payments?.data.length ?? 0) === 0 ? (
          <p className="text-sm text-ink-mute">{t("accountPage.noPayments")}</p>
        ) : (
          <div className="flex flex-col divide-y divide-edge">
            {payments!.data.map((p) => (
              <div key={p.invoice_no} className="flex items-center gap-4 py-3">
                <CreditCard className="size-4.5 shrink-0 text-ink-mute" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{p.invoice_no}</p>
                  <p className="text-xs capitalize text-ink-mute">
                    {p.method} · {p.paid_at ? formatDate(p.paid_at, uiLocale) : t("accountPage.pending")}
                  </p>
                </div>
                <p className="text-sm font-bold tabular-nums">{formatMoney(p.amount, p.currency, uiLocale)}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    p.status === "completed" ? "bg-accent/15 text-accent" : "bg-premium/15 text-premium"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
