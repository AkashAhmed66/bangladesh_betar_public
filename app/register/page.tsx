"use client";

import { Loader2, RadioTower } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, post } from "@/lib/api";
import type { TokenResponse } from "@/lib/types";
import { BRAND } from "@/config/theme";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const toast = useUi((s) => s.toast);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    locale: "bn" as "bn" | "en",
    accept_terms: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await post<TokenResponse>("/auth/register", form);
      setSession(res);
      toast(`Welcome to ${BRAND.name}, ${res.user.name.split(" ")[0]}!`, "success");
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.firstError : "Could not create account.");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-card border border-edge-strong bg-raised px-4 py-3 text-sm outline-none transition placeholder:text-ink-mute focus:border-accent";

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="ambient-drift pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--accent), transparent 70%)" }}
      />

      <Link href="/" className="relative mb-8 flex items-center gap-3">
        <span className="relative flex size-11 items-center justify-center rounded-full bg-accent">
          <RadioTower className="size-6 text-accent-fg" />
          <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-flag ring-2 ring-page" />
        </span>
        <span className="font-display text-2xl font-bold tracking-tight">{BRAND.name}</span>
      </Link>

      <div className="fade-up relative w-full max-w-sm rounded-panel border border-edge bg-elev p-8">
        <h1 className="text-center font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-center text-sm text-ink-soft">Free forever. Premium if you want more.</p>

        {error && <p className="mt-4 rounded-card bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</p>}

        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <input className={input} required placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          <input className={input} type="email" required placeholder="Email address" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
          <input className={input} type="tel" placeholder="Phone (optional)" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
          <input className={input} type="password" required minLength={6} placeholder="Password (min 6 characters)" value={form.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" />
          <input className={input} type="password" required placeholder="Confirm password" value={form.password_confirmation} onChange={(e) => set("password_confirmation", e.target.value)} autoComplete="new-password" />

          <div className="flex gap-1 rounded-full bg-raised p-1">
            {(["bn", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => set("locale", l)}
                className={`flex-1 rounded-full py-1.5 text-sm font-bold transition ${
                  form.locale === l ? "bg-ink text-page" : "text-ink-mute hover:text-ink"
                }`}
              >
                {l === "bn" ? "বাংলা" : "English"}
              </button>
            ))}
          </div>

          <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-soft">
            <input
              type="checkbox"
              required
              checked={form.accept_terms}
              onChange={(e) => set("accept_terms", e.target.checked)}
              className="mt-0.5 size-4 accent-(--accent)"
            />
            I agree to the terms of service and privacy policy of Bangladesh Betar.
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-1 flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" />} Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
