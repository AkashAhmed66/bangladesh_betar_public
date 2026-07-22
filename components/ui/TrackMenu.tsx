"use client";

import { Flag, ListEnd, ListPlus, ListStart, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { post } from "@/lib/api";
import type { PlayerTrack } from "@/stores/player";
import { usePlayer } from "@/stores/player";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

interface TrackMenuProps {
  track: PlayerTrack;
  className?: string;
  extraItems?: { label: string; icon?: React.ReactNode; onClick: () => void; danger?: boolean }[];
}

/** Three-dot context menu for any playable row/card. */
export default function TrackMenu({ track, className = "", extraItems = [] }: TrackMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queueNext = usePlayer((s) => s.queueNext);
  const queueLast = usePlayer((s) => s.queueLast);
  const token = useAuth((s) => s.token);
  const { openLoginPrompt, openAddToPlaylist, toast } = useUi();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const report = async () => {
    if (!token) {
      openLoginPrompt("Sign in to report content.");
      return;
    }
    try {
      await post("/reports", {
        reportable_type: "audio_asset",
        reportable_id: track.assetId,
        reason: "inappropriate",
        details: "Reported from the player menu.",
      });
      toast("Report submitted. Thank you.", "success");
    } catch {
      toast("Could not submit report.", "error");
    }
  };

  const item =
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-ink-soft transition hover:bg-highlight hover:text-ink";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        aria-label="More options"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="rounded-full p-1 text-ink-mute transition hover:text-ink"
      >
        <MoreHorizontal className="size-5" />
      </button>
      {open && (
        <div
          className="fade-up absolute right-0 z-60 mt-1 w-56 rounded-panel border border-edge bg-raised p-1.5 shadow-2xl shadow-black/60"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <button className={item} onClick={() => queueNext(track)}>
            <ListStart className="size-4" /> Play next
          </button>
          <button className={item} onClick={() => queueLast(track)}>
            <ListEnd className="size-4" /> Add to queue
          </button>
          <button
            className={item}
            onClick={() => (token ? openAddToPlaylist(track) : openLoginPrompt("Sign in to build playlists."))}
          >
            <ListPlus className="size-4" /> Add to playlist
          </button>
          <Link href={track.href} className={item}>
            <MoreHorizontal className="size-4" /> Go to details
          </Link>
          {extraItems.map((ei) => (
            <button key={ei.label} className={`${item} ${ei.danger ? "text-danger hover:text-danger" : ""}`} onClick={ei.onClick}>
              {ei.icon} {ei.label}
            </button>
          ))}
          <div className="my-1 border-t border-edge" />
          <button className={item} onClick={report}>
            <Flag className="size-4" /> Report
          </button>
        </div>
      )}
    </div>
  );
}
