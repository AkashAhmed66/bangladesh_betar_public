"use client";

import { Bug, Flag, Inbox, Loader2, Lock, MessageSquareHeart, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApiError, post } from "@/lib/api";
import { useMySubmissions } from "@/lib/hooks";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";
import type { CommunitySubmission, SubmissionStatus } from "@/lib/types";

const FEEDBACK_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "suggestion", label: "Suggestion" },
  { value: "complaint", label: "Complaint" },
  { value: "technical", label: "Technical" },
] as const;

const ISSUE_TYPES = [
  { value: "broken_audio", label: "Broken audio" },
  { value: "wrong_metadata", label: "Wrong information" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Something else" },
] as const;

const STATUS_STYLE: Record<SubmissionStatus, string> = {
  new: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  dismissed: "bg-slate-500/20 text-ink-mute",
};

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const TYPE_ICON: Record<CommunitySubmission["type"], React.ComponentType<{ className?: string }>> = {
  content_report: Flag,
  issue_report: Bug,
  feedback: MessageSquareHeart,
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

/** Unified "Help & feedback": send feedback or report a problem, and track the
 *  status of everything you've submitted (FR-ENG-04/07/09). Guests can submit;
 *  signing in unlocks status tracking. */
export default function SupportPage() {
  const toast = useUi((s) => s.toast);
  const token = useAuth((s) => s.token);
  const { data: mine, mutate, isLoading } = useMySubmissions();

  const [mode, setMode] = useState<"feedback" | "problem">("feedback");

  const [category, setCategory] = useState<string>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [issueType, setIssueType] = useState<string>("broken_audio");
  const [description, setDescription] = useState("");

  const [busy, setBusy] = useState(false);

  const input =
    "w-full rounded-card border border-edge-strong bg-raised px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-mute focus:border-accent";
  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition ${
      active ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
    }`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "feedback") {
        const res = await post<{ message: string }>("/feedback", {
          category,
          subject: subject || undefined,
          message,
        });
        toast(res.message, "success");
        setSubject("");
        setMessage("");
      } else {
        const res = await post<{ message: string }>("/issue-reports", {
          issue_type: issueType,
          description: description || undefined,
        });
        toast(res.message, "success");
        setDescription("");
      }
      if (token) void mutate(); // reflect the new item in "Your submissions"
    } catch (err) {
      toast(err instanceof ApiError ? err.firstError : "Could not send that. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const submissions = mine?.data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Help &amp; feedback</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Tell us what you love, report a problem, and follow what happens next. Guests welcome — sign in to track status.
        </p>
      </div>

      {/* Submission card */}
      <div className="rounded-panel border border-edge bg-raised/50 p-6">
        {/* Mode toggle */}
        <div className="mb-5 inline-flex rounded-full border border-edge-strong p-1">
          <button
            type="button"
            onClick={() => setMode("feedback")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition ${
              mode === "feedback" ? "bg-accent text-accent-fg" : "text-ink-soft hover:text-ink"
            }`}
          >
            <MessageSquareHeart className="size-4" /> Send feedback
          </button>
          <button
            type="button"
            onClick={() => setMode("problem")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition ${
              mode === "problem" ? "bg-accent text-accent-fg" : "text-ink-soft hover:text-ink"
            }`}
          >
            <Bug className="size-4" /> Report a problem
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "feedback" ? (
            <>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_CATEGORIES.map((c) => (
                  <button key={c.value} type="button" onClick={() => setCategory(c.value)} className={chip(category === c.value)}>
                    {c.label}
                  </button>
                ))}
              </div>
              <input className={input} placeholder="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={255} />
              <textarea
                className={`${input} resize-none`}
                rows={4}
                required
                maxLength={2000}
                placeholder="Your message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {ISSUE_TYPES.map((t) => (
                  <button key={t.value} type="button" onClick={() => setIssueType(t.value)} className={chip(issueType === t.value)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <textarea
                className={`${input} resize-none`}
                rows={4}
                required
                maxLength={1000}
                placeholder="What happened? Include the recording name if relevant."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </>
          )}
          <button
            type="submit"
            disabled={busy || (mode === "feedback" ? !message.trim() : !description.trim())}
            className="flex items-center gap-2 self-end rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-40"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {mode === "feedback" ? "Send feedback" : "Submit report"}
          </button>
        </form>
        <p className="mt-3 text-xs text-ink-mute">
          To report a specific recording or comment, use the “Report” action from its menu.
        </p>
      </div>

      {/* Your submissions — the listener's side of the Community Inbox */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Inbox className="size-5 text-accent" />
          <h2 className="font-display text-lg font-bold">Your submissions</h2>
        </div>

        {!token ? (
          <div className="flex flex-col items-start gap-3 rounded-panel border border-edge bg-raised/50 p-6">
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Lock className="size-4" /> Sign in to see the status of your reports and feedback.
            </p>
            <Link href="/login" className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-page transition hover:scale-105">
              Sign in
            </Link>
          </div>
        ) : isLoading ? (
          <div className="rounded-panel border border-edge bg-raised/50 p-6 text-sm text-ink-mute">Loading…</div>
        ) : submissions.length === 0 ? (
          <div className="rounded-panel border border-edge bg-raised/50 p-8 text-center">
            <Inbox className="mx-auto size-8 text-ink-mute" />
            <p className="mt-2 text-sm font-semibold">Nothing submitted yet</p>
            <p className="mt-1 text-xs text-ink-mute">Your feedback and reports will appear here so you can follow their status.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {submissions.map((s) => {
              const Icon = TYPE_ICON[s.type] ?? MessageSquareHeart;
              return (
                <li key={s.id} className="rounded-panel border border-edge bg-raised/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon className="size-4 shrink-0 text-ink-mute" />
                      <span className="text-sm font-bold">{s.type_label}</span>
                      {s.category_label && (
                        <span className="rounded-full bg-raised px-2 py-0.5 text-[11px] font-semibold text-ink-soft">{s.category_label}</span>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </div>

                  {s.subject_line && <p className="mt-2 text-sm font-semibold">{s.subject_line}</p>}
                  {s.message && <p className="mt-1 text-sm text-ink-soft">{s.message}</p>}
                  {s.target?.label && (
                    <p className="mt-1 text-xs text-ink-mute">
                      About: <span className="font-medium text-ink-soft">{s.target.label}</span>
                    </p>
                  )}

                  {s.resolution_notes && (
                    <div className="mt-3 rounded-card border border-edge bg-elev/60 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">Response from the team</p>
                      <p className="mt-1 text-sm text-ink-soft">{s.resolution_notes}</p>
                    </div>
                  )}

                  <p className="mt-2 text-[11px] text-ink-mute">Submitted {fmtDate(s.created_at)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
