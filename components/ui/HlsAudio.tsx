"use client";

import { useEffect, useRef } from "react";
import { attachAudioSource, detachAudioSource } from "@/lib/hls";

/**
 * Download-protected audio player: streams encrypted HLS via hls.js when the
 * URL is a playlist, plain audio otherwise. No download control, no context
 * menu — the UI never offers a way to save the recording.
 */
export default function HlsAudio({
  src,
  className,
  preload = "metadata",
}: {
  src: string;
  className?: string;
  preload?: "none" | "metadata" | "auto";
}) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    void attachAudioSource(el, src);
    return () => detachAudioSource(el);
  }, [src]);

  return (
    <audio
      ref={ref}
      controls
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      preload={preload}
      className={className}
    />
  );
}
