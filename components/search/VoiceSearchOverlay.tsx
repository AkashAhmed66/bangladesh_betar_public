"use client";

import { Check, Mic, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { recognitionCtor, type Recognition, type VoiceLang } from "@/lib/speech";
import { useUi } from "@/stores/ui";

type Status = "listening" | "heard" | "error";

/**
 * Immersive "Listening…" overlay (YouTube/Google style): a big animated mic,
 * live interim transcript, an EN/বাংলা switch, graceful error + retry, and
 * Esc / backdrop / ✕ to cancel. Recognition runs here; only the FINAL text is
 * handed back, so the search box isn't spammed with partial phrases.
 */
export default function VoiceSearchOverlay({
  onResult,
  onClose,
}: {
  onResult: (text: string) => void;
  onClose: () => void;
}) {
  const locale = useUi((s) => s.locale);
  const [lang, setLang] = useState<VoiceLang>(locale === "bn" ? "bn-BD" : "en-US");
  const [status, setStatus] = useState<Status>("listening");
  const [interim, setInterim] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const recRef = useRef<Recognition | null>(null);
  const finalRef = useRef(false);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fully tear down the current recogniser: cancel any pending start-retry or
  // result hand-off, detach its handlers (so a late onend/onerror from the
  // aborted session can't clobber the next one), then abort it.
  const stopCurrent = () => {
    if (startTimer.current) { clearTimeout(startTimer.current); startTimer.current = null; }
    if (resultTimer.current) { clearTimeout(resultTimer.current); resultTimer.current = null; }
    const prev = recRef.current;
    recRef.current = null;
    if (prev) {
      prev.onresult = null;
      prev.onerror = null;
      prev.onend = null;
      try {
        prev.abort();
      } catch {
        /* noop */
      }
    }
  };

  const start = (l: VoiceLang) => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    stopCurrent();
    finalRef.current = false;
    setInterim("");
    setErrorMsg("");
    setStatus("listening");

    const rec = new Ctor();
    rec.lang = l;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      if (recRef.current !== rec) return; // ignore a superseded recogniser
      let itxt = "";
      let ftxt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) ftxt += r[0].transcript;
        else itxt += r[0].transcript;
      }
      if (itxt) setInterim(itxt);
      if (ftxt.trim()) {
        finalRef.current = true;
        setInterim(ftxt.trim());
        setStatus("heard");
        resultTimer.current = setTimeout(() => onResult(ftxt.trim()), 500); // brief "Got it" beat
      }
    };
    rec.onerror = (e) => {
      if (recRef.current !== rec || e.error === "aborted") return;
      setStatus("error");
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setErrorMsg("Microphone is blocked. Allow mic access in your browser, then try again.");
      } else if (e.error === "no-speech") {
        setErrorMsg("Didn't catch anything. Tap the mic to try again.");
      } else if (e.error === "network") {
        setErrorMsg("Network issue reaching speech recognition. Check your connection and retry.");
      } else {
        setErrorMsg("Voice search didn't work. Try again, or just type your search.");
      }
    };
    rec.onend = () => {
      if (recRef.current !== rec || finalRef.current) return;
      // Ended with nothing recognised → offer a retry rather than dead air.
      setStatus((s) => (s === "listening" ? "error" : s));
      setErrorMsg((m) => m || "Didn't catch anything. Tap the mic to try again.");
    };

    recRef.current = rec;

    // Chrome throws InvalidStateError when start() races the previous session's
    // teardown (this is what made a language switch need several presses). Retry
    // on a short cadence until it takes, so a single press always works.
    const attempt = (n: number) => {
      if (recRef.current !== rec) return; // superseded by a newer start
      try {
        rec.start();
      } catch {
        if (n < 10) startTimer.current = setTimeout(() => attempt(n + 1), 100);
      }
    };
    attempt(0);
  };

  // Switch the dictation language and restart cleanly (no double-press needed).
  const switchLang = (l: VoiceLang) => {
    if (l === lang) return;
    setLang(l);
    start(l);
  };

  // Start once on mount; tear down on unmount.
  useEffect(() => {
    start(lang);
    return () => stopCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Esc to cancel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock background scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const heading = status === "listening" ? "Listening…" : status === "heard" ? "Got it" : "Try again";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Voice search"
    >
      <div
        className="fade-up relative flex w-full max-w-sm flex-col items-center gap-6 rounded-panel border border-edge bg-raised p-8 text-center shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cancel voice search"
          className="absolute right-3.5 top-3.5 text-ink-mute transition hover:text-ink"
        >
          <X className="size-5" />
        </button>

        {/* Dictation language */}
        <div className="flex items-center gap-1 rounded-full bg-sunken p-1 text-xs font-bold">
          {(["en-US", "bn-BD"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchLang(l)}
              className={`cursor-pointer rounded-full px-3 py-1 transition ${
                lang === l ? "bg-accent text-accent-fg" : "text-ink-mute hover:text-ink"
              }`}
            >
              {l === "bn-BD" ? "বাংলা" : "English"}
            </button>
          ))}
        </div>

        {/* Animated mic — purely decorative; must never intercept clicks meant
            for the language buttons (the expanding rings overflow this box). */}
        <div className="pointer-events-none relative grid size-28 place-items-center">
          {status === "listening" && (
            <>
              <span className="absolute size-full animate-ping rounded-full bg-accent/25" />
              <span className="absolute size-20 animate-ping rounded-full bg-accent/20 [animation-delay:300ms]" />
            </>
          )}
          <span
            className={`relative grid size-20 place-items-center rounded-full transition-colors ${
              status === "error" ? "bg-danger/15 text-danger" : "bg-accent text-accent-fg"
            }`}
          >
            {status === "heard" ? <Check className="size-9" /> : <Mic className="size-9" />}
          </span>
        </div>

        {/* Live equalizer while listening (reuses the app's .eq-bars) */}
        {status === "listening" && (
          <div className="eq-bars pointer-events-none flex h-6 items-end gap-1" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ height: "100%" }} />
            ))}
          </div>
        )}

        {/* Status + transcript */}
        <div className="min-h-[4rem] space-y-1.5" aria-live="polite">
          <p className="text-sm font-semibold text-ink-soft">{heading}</p>
          {status === "error" ? (
            <p className="text-sm leading-relaxed text-ink-mute">{errorMsg}</p>
          ) : (
            <p className="text-lg font-medium leading-snug">
              {interim || <span className="text-ink-mute">Speak now — say a title or a phrase…</span>}
            </p>
          )}
        </div>

        {/* Retry after an error */}
        {status === "error" && (
          <button
            onClick={() => start(lang)}
            className="flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-bold text-page transition hover:scale-105"
          >
            <Mic className="size-4" /> Tap to try again
          </button>
        )}
      </div>
    </div>
  );
}
