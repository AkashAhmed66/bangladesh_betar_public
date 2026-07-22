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

export default function AccountPage() {
  const { token, user, hydrated, updateProfile } = useAuth();
  const { data: sub, mutate: refreshSub } = useSubscription();
  const { data: payments } = usePayments();
  const toast = useUi((s) => s.toast);

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
        title="Your account"
        subtitle="Sign in to manage your profile and subscription."
        action={
          <Link href="/login" className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover">
            Sign in
          </Link>
        }
      />
    );
  }

  const saveProfile = async () => {
    setBusy(true);
    try {
      await updateProfile({ name, phone: phone || null, locale });
      toast("Profile updated.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.firstError : "Could not update profile.", "error");
    } finally {
      setBusy(false);
    }
  };

  const togglePersonalization = async () => {
    const next = !optOut;
    setOptOut(next);
    try {
      await post("/me/personalization/opt-out", { opt_out: next });
      toast(next ? "Personalisation disabled." : "Personalisation enabled.", "success");
    } catch {
      setOptOut(!next);
      toast("Could not update preference.", "error");
    }
  };

  const cancelSubscription = async () => {
    if (!confirm("Cancel auto-renewal? Premium stays active until the period ends.")) return;
    try {
      const res = await post<{ message: string }>("/me/subscription/cancel");
      toast(res.message, "success");
      void refreshSub();
    } catch (err) {
      toast(err instanceof ApiError ? err.firstError : "Could not cancel.", "error");
    }
  };

  const input =
    "w-full rounded-card border border-edge-strong bg-raised px-4 py-2.5 text-sm outline-none transition focus:border-accent";
  const subscription = sub?.subscription;
  const ent = sub?.entitlements;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">Account</h1>

      {/* Profile */}
      <section className="rounded-panel border border-edge bg-raised/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <User className="size-5 text-accent" /> Profile
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Name
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Phone
            <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01700000000" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Email
            <input className={`${input} opacity-60`} value={user?.email ?? ""} disabled />
          </label>
          <div className="flex flex-col gap-1.5 text-sm font-semibold">
            Preferred language
            <div className="flex gap-1 rounded-full bg-raised p-1">
              {(["bn", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`flex-1 rounded-full py-1.5 text-sm font-bold transition ${
                    locale === l ? "bg-ink text-page" : "text-ink-mute hover:text-ink"
                  }`}
                >
                  {l === "bn" ? "বাংলা" : "English"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            onClick={togglePersonalization}
            className="flex items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-ink"
          >
            <ShieldOff className={`size-4 ${optOut ? "text-danger" : "text-ink-mute"}`} />
            {optOut ? "Personalised recommendations are off" : "Personalised recommendations are on"}
          </button>
          <button
            onClick={saveProfile}
            disabled={busy}
            className="flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" />} Save
          </button>
        </div>
      </section>

      {/* Subscription */}
      <section className="rounded-panel border border-edge bg-raised/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Crown className="size-5 text-premium" /> Subscription
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
                ? `Renews ${formatDate(subscription.ends_at)}`
                : `Active until ${formatDate(subscription.ends_at)} (auto-renew off)`}
              {subscription.trial_ends_at && ` · trial ends ${formatDate(subscription.trial_ends_at)}`}
            </p>
            {subscription.auto_renew && (
              <button
                onClick={cancelSubscription}
                className="self-start rounded-full border border-edge-strong px-5 py-2 text-sm font-bold text-danger transition hover:border-danger"
              >
                Cancel auto-renewal
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-ink-soft">
              You are on the <span className="font-bold text-ink">Free</span> plan
              {ent ? ` — up to ${ent.max_quality_kbps} kbps with ads.` : "."}
            </p>
            <Link
              href="/premium"
              className="flex items-center gap-2 rounded-full bg-premium px-6 py-2 text-sm font-bold text-premium-fg transition hover:scale-105"
            >
              <Crown className="size-4" /> Upgrade to Premium
            </Link>
          </div>
        )}
      </section>

      {/* Payments */}
      <section className="rounded-panel border border-edge bg-raised/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Receipt className="size-5 text-accent" /> Payment history
        </h2>
        {(payments?.data.length ?? 0) === 0 ? (
          <p className="text-sm text-ink-mute">No payments yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-edge">
            {payments!.data.map((p) => (
              <div key={p.invoice_no} className="flex items-center gap-4 py-3">
                <CreditCard className="size-4.5 shrink-0 text-ink-mute" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{p.invoice_no}</p>
                  <p className="text-xs capitalize text-ink-mute">
                    {p.method} · {p.paid_at ? formatDate(p.paid_at) : "pending"}
                  </p>
                </div>
                <p className="text-sm font-bold tabular-nums">{formatMoney(p.amount, p.currency)}</p>
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
