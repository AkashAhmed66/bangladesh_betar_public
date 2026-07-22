"use client";

import { Loader2, Phone, RadioTower } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, post } from "@/lib/api";
import type { TokenResponse } from "@/lib/types";
import { BRAND } from "@/config/theme";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

type Mode = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const toast = useUi((s) => s.toast);

  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await post<TokenResponse>("/auth/login", { email, password, device_name: "web" });
      setSession(res);
      toast(`Welcome back, ${res.user.name.split(" ")[0]}!`, "success");
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.firstError : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const requestOtp = async () => {
    if (!phone.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await post<{ message: string }>("/auth/otp/request", { phone });
      setOtpSent(true);
      toast(res.message, "info");
    } catch (err) {
      setError(err instanceof ApiError ? err.firstError : "Could not send OTP.");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await post<TokenResponse>("/auth/otp/verify", { phone, otp });
      setSession(res);
      toast(`Welcome, ${res.user.name.split(" ")[0]}!`, "success");
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.firstError : "Could not verify OTP.");
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
        <h1 className="text-center font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-ink-soft">Sign in to continue listening</p>

        <div className="mt-6 flex gap-1 rounded-full bg-raised p-1">
          {(["email", "otp"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`flex-1 rounded-full py-1.5 text-sm font-bold transition ${
                mode === m ? "bg-ink text-page" : "text-ink-mute hover:text-ink"
              }`}
            >
              {m === "email" ? "Email" : "Phone (OTP)"}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 rounded-card bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</p>}

        {mode === "email" ? (
          <form onSubmit={submitEmail} className="mt-5 flex flex-col gap-3">
            <input className={input} type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <input className={input} type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <button
              type="submit"
              disabled={busy}
              className="mt-1 flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" />} Sign in
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="mt-5 flex flex-col gap-3">
            <div className="flex gap-2">
              <input className={input} type="tel" required placeholder="01700000000" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
              <button
                type="button"
                onClick={requestOtp}
                disabled={busy || !phone.trim()}
                className="shrink-0 rounded-card border border-edge-strong px-4 text-sm font-bold transition enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
              >
                <Phone className="size-4" />
              </button>
            </div>
            {otpSent && (
              <>
                <input className={`${input} text-center tracking-[0.5em]`} inputMode="numeric" maxLength={6} required placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <p className="text-center text-xs text-ink-mute">Demo environment — the OTP is 123456</p>
              </>
            )}
            <button
              type="submit"
              disabled={busy || !otpSent || otp.length < 6}
              className="mt-1 flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" />} Verify & sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-soft">
          New to {BRAND.shortName}?{" "}
          <Link href="/register" className="font-bold text-accent hover:underline">Create an account</Link>
        </p>
      </div>

      <Link href="/" className="relative mt-6 text-xs font-semibold text-ink-mute transition hover:text-ink">
        ← Continue as guest
      </Link>
    </div>
  );
}
