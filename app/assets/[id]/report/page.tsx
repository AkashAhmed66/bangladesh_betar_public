"use client";

import { ArrowLeft, CheckCircle2, Flag, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import Artwork from "@/components/ui/Artwork";
import { Skeleton } from "@/components/ui/Misc";
import { displayTitle } from "@/lib/format";
import { ApiError, post } from "@/lib/api";
import { useAsset } from "@/lib/hooks";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

const REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "copyright", label: "Copyright concern" },
  { value: "abuse", label: "Abuse or harassment" },
  { value: "spam", label: "Spam or misleading" },
  { value: "other", label: "Something else" },
] as const;

/** Report a specific recording — the audio is linked so the moderation team
 *  (and the reporter, in Help & feedback) can see exactly what it's about. */
export default function ReportAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useAuth((s) => s.token);
  const locale = useUi((s) => s.locale);
  const toast = useUi((s) => s.toast);
  const { data, isLoading } = useAsset(id);
  const asset = data?.data;

  const [reason, setReason] = useState<string>("inappropriate");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const input =
    "w-full rounded-card border border-edge-strong bg-raised px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-mute focus:border-accent";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await post("/reports", {
        reportable_type: "audio_asset",
        reportable_id: Number(id),
        reason,
        details: details || undefined,
      });
      setDone(true);
    } catch (err) {
      toast(err instanceof ApiError ? err.firstError : "Could not submit the report.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href={asset ? `/assets/${asset.id}` : "/"}
        className="flex items-center gap-2 self-start text-sm text-ink-soft transition hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>

      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
          <Flag className="size-6 text-danger" /> Report this recording
        </h1>
        <p className="mt-1 text-sm text-ink-soft">Tell us what&apos;s wrong. Our team reviews every report.</p>
      </div>

      {/* The recording being reported — linked for reference */}
      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-panel" />
      ) : asset ? (
        <Link
          href={`/assets/${asset.id}`}
          className="flex items-center gap-3 rounded-panel border border-edge bg-raised/50 p-3 transition hover:bg-highlight"
        >
          <Artwork type="audio_asset" id={asset.id} url={asset.artwork_url} title={asset.title} className="size-14 shrink-0" />
          <div className="min-w-0">
            <p className="clamp-1 font-semibold">{displayTitle(asset, locale)}</p>
            <p className="clamp-1 text-xs text-ink-mute">
              {asset.programme || asset.station || asset.archive_no || "Archive recording"}
            </p>
          </div>
        </Link>
      ) : (
        <p className="rounded-panel border border-edge bg-raised/50 p-4 text-sm text-ink-mute">Recording not found.</p>
      )}

      {done ? (
        <div className="rounded-panel border border-edge bg-raised/50 p-8 text-center">
          <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
          <p className="mt-3 text-lg font-bold">Report submitted</p>
          <p className="mt-1 text-sm text-ink-soft">
            Thank you — our team will review it. You can follow its status in Help &amp; feedback.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link href="/support" className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover">
              Track status
            </Link>
            {asset && (
              <Link href={`/assets/${asset.id}`} className="rounded-full border border-edge-strong px-5 py-2 text-sm font-bold transition hover:border-ink">
                Back to recording
              </Link>
            )}
          </div>
        </div>
      ) : !token ? (
        <div className="flex flex-col items-start gap-3 rounded-panel border border-edge bg-raised/50 p-6">
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Lock className="size-4" /> Please sign in to submit a report.
          </p>
          <Link href="/login" className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-page transition hover:scale-105">
            Sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-panel border border-edge bg-raised/50 p-6">
          <div>
            <p className="mb-2 text-sm font-semibold">Reason</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    reason === r.value ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">
              Details <span className="font-normal text-ink-mute">(optional)</span>
            </p>
            <textarea
              className={`${input} resize-none`}
              rows={4}
              maxLength={1000}
              placeholder="Add anything that will help us review this…"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 self-end rounded-full bg-danger px-6 py-2 text-sm font-bold text-white transition enabled:hover:opacity-90 disabled:opacity-40"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Flag className="size-4" />} Submit report
          </button>
        </form>
      )}
    </div>
  );
}
