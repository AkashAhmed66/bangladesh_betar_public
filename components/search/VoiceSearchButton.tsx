"use client";

import { Mic } from "lucide-react";
import { useEffect, useState } from "react";
import { speechSupported } from "@/lib/speech";
import VoiceSearchOverlay from "./VoiceSearchOverlay";

/**
 * YouTube-style voice search trigger. Opens an immersive listening overlay and
 * hands the final transcript back to the search box. Hides itself entirely when
 * the browser has no SpeechRecognition support (e.g. Firefox), so the search
 * box never breaks.
 */
export default function VoiceSearchButton({ onResult }: { onResult: (text: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setSupported(speechSupported()), []);

  if (!supported) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search by voice"
        title="Search by voice"
        className="grid size-8 shrink-0 place-items-center rounded-full text-ink-mute transition hover:bg-highlight hover:text-ink"
      >
        <Mic className="size-4.5" />
      </button>
      {open && (
        <VoiceSearchOverlay
          onClose={() => setOpen(false)}
          onResult={(t) => {
            onResult(t);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
