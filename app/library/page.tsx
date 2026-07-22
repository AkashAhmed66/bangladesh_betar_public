"use client";

import { Heart, History, Library, ListMusic, Plus, UserCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Artwork from "@/components/ui/Artwork";
import Modal from "@/components/ui/Modal";
import { EmptyState, SectionHeading, Skeleton } from "@/components/ui/Misc";
import { post } from "@/lib/api";
import { typeLabel } from "@/lib/format";
import { useFollows, useMyPlaylists } from "@/lib/hooks";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

function LibraryContent() {
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);
  const { data: playlists, isLoading, mutate } = useMyPlaylists();
  const { data: follows } = useFollows();
  const params = useSearchParams();
  const router = useRouter();
  const toast = useUi((s) => s.toast);

  const [createOpen, setCreateOpen] = useState(() => params.get("create") === "1");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  if (hydrated && !token) {
    return (
      <EmptyState
        icon={<Library className="size-10" />}
        title="Your library lives here"
        subtitle="Sign in to keep playlists, favourites, follows and listening history in one place."
        action={
          <Link href="/login" className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover">
            Sign in
          </Link>
        }
      />
    );
  }

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

  const followGroups = Object.entries(follows?.data ?? {});

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight">Your Library</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover"
        >
          <Plus className="size-4" /> New playlist
        </button>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/favorites" className="flex items-center gap-4 rounded-panel bg-gradient-to-br from-accent/25 to-raised p-5 transition hover:from-accent/35">
          <span className="flex size-12 items-center justify-center rounded-card bg-accent text-accent-fg">
            <Heart className="size-6 fill-current" />
          </span>
          <div>
            <p className="font-display font-bold">Liked recordings</p>
            <p className="text-xs text-ink-soft">Everything you have favourited</p>
          </div>
        </Link>
        <Link href="/history" className="flex items-center gap-4 rounded-panel bg-gradient-to-br from-highlight to-raised p-5 transition hover:from-edge-strong">
          <span className="flex size-12 items-center justify-center rounded-card bg-ink text-page">
            <History className="size-6" />
          </span>
          <div>
            <p className="font-display font-bold">Listening history</p>
            <p className="text-xs text-ink-soft">Pick up where you left off</p>
          </div>
        </Link>
      </div>

      {/* Playlists */}
      <section>
        <SectionHeading title="Playlists" />
        {isLoading ? (
          <div className="-mx-3 flex flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-44 p-3"><Skeleton className="aspect-square w-full" /></div>
            ))}
          </div>
        ) : (playlists?.data.length ?? 0) === 0 ? (
          <EmptyState
            icon={<ListMusic className="size-10" />}
            title="No playlists yet"
            subtitle="Create your first playlist and start collecting the archive."
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
      </section>

      {/* Follows */}
      <section>
        <SectionHeading title="Following" />
        {followGroups.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="size-10" />}
            title="Not following anything yet"
            subtitle="Follow artists, programmes and podcasts to find them here."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {followGroups.map(([type, items]) => (
              <div key={type}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                  {typeLabel(type)}s
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((f) => (
                    <Link
                      key={`${f.type}:${f.id}`}
                      href={
                        f.type === "artist" ? `/artists/${f.id}`
                        : f.type === "programme" ? `/programmes/${f.id}`
                        : f.type === "podcast_channel" ? `/podcasts/${f.id}`
                        : `/playlists/${f.id}`
                      }
                      className="rounded-full border border-edge bg-raised px-4 py-1.5 text-sm font-semibold text-ink-soft transition hover:border-accent hover:text-ink"
                    >
                      {f.name ?? `${typeLabel(f.type)} #${f.id}`}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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

export default function LibraryPage() {
  return (
    <Suspense>
      <LibraryContent />
    </Suspense>
  );
}
