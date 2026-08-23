"use client";

import { Crown, Film, LoaderCircle, LockKeyhole, LogIn, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/stores/auth";

export default function PremiumWatchGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const { t } = useTranslation();
  const token = useAuth((state) => state.token);
  const entitlements = useAuth((state) => state.entitlements);
  const hydrated = useAuth((state) => state.hydrated);

  if (!hydrated || (token && !entitlements)) {
    return (
      <div className="grid min-h-[34rem] place-items-center bg-elev px-5">
        <div className="flex items-center gap-3 text-sm font-bold text-ink-soft" role="status">
          <LoaderCircle className="size-5 animate-spin text-[var(--portal-color)]" />
          {t("ottAccess.checking")}
        </div>
      </div>
    );
  }

  if (token && entitlements?.is_premium) return children;

  const signedIn = Boolean(token);

  return (
    <section className="relative isolate grid min-h-[calc(100dvh-9rem)] overflow-hidden bg-[#071315] px-4 py-12 text-white sm:px-8 sm:py-16">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(56,191,193,.3),transparent_30%),radial-gradient(circle_at_82%_74%,rgba(208,52,79,.2),transparent_34%),linear-gradient(135deg,#071315,#111b20_55%,#090d11)]" />
      <div aria-hidden className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#75e3df] backdrop-blur">
            <Sparkles className="size-4" /> {t("ottAccess.eyebrow")}
          </span>
          <h1 className="mt-6 max-w-3xl text-balance font-display text-5xl font-bold leading-[.94] tracking-[-0.055em] sm:text-7xl">
            {signedIn ? t("ottAccess.premiumTitle") : t("ottAccess.loginTitle")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg">
            {signedIn ? t("ottAccess.premiumDescription") : t("ottAccess.loginDescription")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={signedIn ? "/premium" : "/login?next=/watch"}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black shadow-xl transition hover:scale-[1.02]"
            >
              {signedIn ? <Crown className="size-5" /> : <LogIn className="size-5" />}
              {signedIn ? t("ottAccess.upgrade") : t("ottAccess.signIn")}
            </Link>
            <Link href="/" className="inline-flex min-h-12 items-center rounded-full border border-white/20 bg-white/8 px-6 text-sm font-black text-white backdrop-blur transition hover:bg-white/15">
              {t("ottAccess.backHome")}
            </Link>
          </div>
        </div>

        <aside className="rounded-[1.4rem] border border-white/14 bg-white/8 p-6 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-7">
          <span className="grid size-14 place-items-center rounded-full bg-[#75e3df] text-[#071315]">
            {signedIn ? <Crown className="size-6" /> : <LockKeyhole className="size-6" />}
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold">{t("ottAccess.includedTitle")}</h2>
          <ul className="mt-5 space-y-4 text-sm text-white/72">
            <li className="flex gap-3"><Film className="mt-0.5 size-4.5 shrink-0 text-[#75e3df]" /> {t("ottAccess.featureShows")}</li>
            <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-[#75e3df]" /> {t("ottAccess.featureLive")}</li>
            <li className="flex gap-3"><Crown className="mt-0.5 size-4.5 shrink-0 text-[#75e3df]" /> {t("ottAccess.featurePremium")}</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
