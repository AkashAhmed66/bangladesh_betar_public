"use client";

import { ListMusic, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Artwork from "@/components/ui/Artwork";
import Modal from "@/components/ui/Modal";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { post } from "@/lib/api";
import { useMyPlaylists } from "@/lib/hooks";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

/** Dedicated "Playlists" page — reached from the sidebar (which no longer lists
 *  every playlist inline). Lists all of the listener's playlists. */
export default function PlaylistsPage() {
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);
  const { data: playlists, isLoading, mutate } = useMyPlaylists();
  const router = useRouter();
  const toast = useUi((s) => s.toast);

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const createPlaylist = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      const res = await post<{ data: { id: number } }>("/me/playlists", { title: title.trim() });
      toast("Playlist created.", "success");
      setCreateOpen(false);
      setTitle("");
      void mutate();
      router.push(`/playlists/${res.data.id}`);
    } catch {
      toast("Could not create playlist.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (hydrated && !token) {
    return (
      <EmptyState
        icon={<ListMusic className="size-10" />}
        title="Your playlists live here"
        subtitle="Sign in to create playlists and collect the archive your way."
        action={
          <Link href="/login" className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover">
            Sign in
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight">Playlists</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover"
        >
          <Plus className="size-4" /> New playlist
        </button>
      </div>

      {isLoading ? (
        <div className="-mx-3 flex flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-44 p-3">
              <Skeleton className="aspect-square w-full" />
            </div>
          ))}
        </div>
      ) : (playlists?.data.length ?? 0) === 0 ? (
        <EmptyState
          icon={<ListMusic className="size-10" />}
          title="No playlists yet"
          subtitle="Create your first playlist and start collecting the archive."
          action={
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover"
            >
              New playlist
            </button>
          }
        />
      ) : (
        <div className="-mx-3 flex flex-wrap">
          {playlists!.data.map((p) => (
            <Link
              key={p.id}
              href={`/playlists/${p.id}`}
              className="group flex w-40 shrink-0 flex-col gap-3 rounded-panel p-3 transition hover:bg-raised sm:w-44"
            >
              <Artwork type="playlist" id={p.id} url={p.artwork_url} title={p.title} className="aspect-square w-full shadow-lg shadow-black/40" />
              <div>
                <p className="clamp-1 text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-ink-mute">{p.items_count ?? 0} items</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New playlist">
        <div className="flex flex-col gap-4">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
            placeholder="My rainy-day Nazrul geeti…"
            className="rounded-card border border-edge-strong bg-raised px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={createPlaylist}
            disabled={!title.trim() || busy}
            className="rounded-full bg-accent py-2.5 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-40"
          >
            Create playlist
          </button>
        </div>
      </Modal>
    </div>
  );
}
