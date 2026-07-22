"use client";

import { Bug, Loader2, MessageSquareHeart, Send } from "lucide-react";
import { useState } from "react";
import { ApiError, post } from "@/lib/api";
import { useUi } from "@/stores/ui";

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

/** Guest-friendly feedback + issue reporting (FR-ENG-07/09). */
export default function SupportPage() {
  const toast = useUi((s) => s.toast);

  const [category, setCategory] = useState<string>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [fbBusy, setFbBusy] = useState(false);

  const [issueType, setIssueType] = useState<string>("broken_audio");
  const [description, setDescription] = useState("");
  const [issueBusy, setIssueBusy] = useState(false);

  const input =
    "w-full rounded-card border border-edge-strong bg-raised px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-mute focus:border-accent";

  const sendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbBusy(true);
    try {
      const res = await post<{ message: string }>("/feedback", {
        category,
        subject: subject || undefined,
        message,
      });
      toast(res.message, "success");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast(err instanceof ApiError ? err.firstError : "Could not send feedback.", "error");
    } finally {
      setFbBusy(false);
    }
  };

  const sendIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueBusy(true);
    try {
      const res = await post<{ message: string }>("/issue-reports", {
        issue_type: issueType,
        description: description || undefined,
      });
      toast(res.message, "success");
      setDescription("");
    } catch (err) {
      toast(err instanceof ApiError ? err.firstError : "Could not submit report.", "error");
    } finally {
      setIssueBusy(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Feedback & support</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Tell us what you love, what is broken, and what the archive should have next. Guests welcome.
        </p>
      </div>

      <form onSubmit={sendFeedback} className="rounded-panel border border-edge bg-raised/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <MessageSquareHeart className="size-5 text-accent" /> Share feedback
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  category === c.value ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
                }`}
              >
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
          <button
            type="submit"
            disabled={fbBusy || !message.trim()}
            className="flex items-center gap-2 self-end rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-40"
          >
            {fbBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send
          </button>
        </div>
      </form>

      <form onSubmit={sendIssue} className="rounded-panel border border-edge bg-raised/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <Bug className="size-5 text-danger" /> Report a problem
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {ISSUE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setIssueType(t.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  issueType === t.value ? "bg-ink text-page" : "bg-raised text-ink-soft hover:bg-highlight"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            className={`${input} resize-none`}
            rows={3}
            maxLength={1000}
            placeholder="What happened? Include the recording name if relevant."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="submit"
            disabled={issueBusy}
            className="flex items-center gap-2 self-end rounded-full border border-edge-strong px-6 py-2 text-sm font-bold transition enabled:hover:border-danger enabled:hover:text-danger disabled:opacity-40"
          >
            {issueBusy && <Loader2 className="size-4 animate-spin" />} Submit report
          </button>
        </div>
      </form>
    </div>
  );
}
