"use client";

import { Check, Flag, Info, ListEnd, ListPlus, ListStart, Loader2, LockKeyhole, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PlayerTrack } from "@/stores/player";
import { usePlayer } from "@/stores/player";
import { useAuth } from "@/stores/auth";
import { useDownloads } from "@/stores/downloads";
import { useUi } from "@/stores/ui";

interface TrackMenuProps {
  track: PlayerTrack;
  className?: string;
  extraItems?: { label: string; icon?: React.ReactNode; onClick: () => void; danger?: boolean }[];
}

/**
 * Three-dot context menu for any playable row/card. The popover is rendered in
 * a portal on document.body with fixed positioning, so it is never clipped by a
 * row's hover-opacity wrapper or by overflow/scroll containers (which is what
 * previously made it appear broken inside track lists).
 */
export default function TrackMenu({ track, className = "", extraItems = [] }: TrackMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; right: number }>({ right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const queueNext = usePlayer((s) => s.queueNext);
  const queueLast = usePlayer((s) => s.queueLast);
  const token = useAuth((s) => s.token);
  const downloaded = useDownloads((s) => !!s.records[track.assetId]);
  const dlProgress = useDownloads((s) => s.progress[track.assetId]);
  const download = useDownloads((s) => s.download);
  const removeDownload = useDownloads((s) => s.remove);
  const { openLoginPrompt, openAddToPlaylist } = useUi();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    };
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (open) {
      setOpen(false);
      return;
    }
    const r = btnRef.current!.getBoundingClientRect();
    const right = Math.max(8, window.innerWidth - r.right);
    const spaceBelow = window.innerHeight - r.bottom;
    // Flip upward when there isn't room below.
    setCoords(spaceBelow < 320 ? { bottom: window.innerHeight - r.top + 6, right } : { top: r.bottom + 6, right });
    setOpen(true);
  };

  const item =
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-ink-soft transition hover:bg-highlight hover:text-ink";

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        aria-label="More options"
        aria-expanded={open}
        onClick={toggle}
        className="rounded-full p-1 text-ink-mute transition hover:text-ink"
      >
        <MoreHorizontal className="size-5" />
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            ref={menuRef}
            className="fade-up fixed z-[200] w-56 rounded-panel border border-edge bg-raised p-1.5 shadow-2xl shadow-black/60"
            style={{ top: coords.top, bottom: coords.bottom, right: coords.right }}
            onClick={(e) => {
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
            {/* Offline saves store the ENCRYPTED HLS package — never a plain
                audio file (download-protection policy). */}
            {downloaded ? (
              <button className={item} onClick={() => removeDownload(track.assetId)}>
                <Check className="size-4 text-accent" /> Saved offline — remove
              </button>
            ) : dlProgress != null ? (
              <span className={`${item} cursor-default`}>
                <Loader2 className="size-4 animate-spin" /> Saving… {dlProgress}%
              </span>
            ) : (
              <button className={item} onClick={() => download(track)}>
                <LockKeyhole className="size-4" /> Save offline (encrypted)
              </button>
            )}
            <Link href={track.href} className={item}>
              <Info className="size-4" /> Go to details
            </Link>
            {extraItems.map((ei) => (
              <button key={ei.label} className={`${item} ${ei.danger ? "text-danger hover:text-danger" : ""}`} onClick={ei.onClick}>
                {ei.icon} {ei.label}
              </button>
            ))}
            <div className="my-1 border-t border-edge" />
            <Link href={`/assets/${track.assetId}/report`} className={`${item} text-danger hover:text-danger`}>
              <Flag className="size-4" /> Report this recording
            </Link>
          </div>,
          document.body,
        )}
    </div>
  );
}
