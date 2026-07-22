"use client";

import { Globe2, Lock, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import TrackTable from "@/components/cards/TrackTable";
import DetailHero from "@/components/detail/DetailHero";
import Modal from "@/components/ui/Modal";
import FollowButton from "@/components/ui/FollowButton";
import { PlayCircle, Skeleton, EmptyState } from "@/components/ui/Misc";
import { destroy, put } from "@/lib/api";
import { displayTitle, altTitle, formatCount } from "@/lib/format";
import { useMyPlaylist, usePublicPlaylist } from "@/lib/hooks";
import { playlistTracks } from "@/lib/tracks";
import { useAuth } from "@/stores/auth";
import { usePlayer } from "@/stores/player";
import { useUi } from "@/stores/ui";

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useAuth((s) => s.token);
  const router = useRouter();

  // Owners/editorial/public all resolve through /me for members; guests use the public route.
  const mine = useMyPlaylist(id);
  const pub = usePublicPlaylist(id);
  const { data, isLoading, mutate } = token ? mine : pub;

  const playlist = data?.data;
  const playContext = usePlayer((s) => s.playContext);
  const locale = useUi((s) => s.locale);
  const toast = useUi((s) => s.toast);

  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const tracks = useMemo(() => playlistTracks(playlist?.items), [playlist]);
  const itemIds = useMemo(
    () => (playlist?.items ?? []).slice().sort((a, b) => a.position - b.position).map((i) => i.id),
    [playlist],
  );

  if (isLoading || (!playlist && !data)) {
    return <Skeleton className="h-72 w-full rounded-panel" />;
  }

  if (!playlist) {
    return <EmptyState title="Playlist not found" subtitle="It may be private or removed." />;
  }

  const isOwner = playlist.is_owner === true;

  const saveEdit = async () => {
    try {
      await put(`/me/playlists/${playlist.id}`, { title, description: description || null, is_public: isPublic });
      toast("Playlist updated.", "success");
      setEditOpen(false);
      void mutate();
    } catch {
      toast("Could not update playlist.", "error");
    }
  };

  const removePlaylist = async () => {
    if (!confirm(`Delete “${playlist.title}”? This cannot be undone.`)) return;
    try {
      await destroy(`/me/playlists/${playlist.id}`);
      toast("Playlist deleted.", "success");
      router.push("/library");
    } catch {
      toast("Could not delete playlist.", "error");
    }
  };

  const removeItem = async (index: number) => {
    const itemId = itemIds[index];
    if (itemId == null) return;
    try {
      await destroy(`/me/playlists/${playlist.id}/items/${itemId}`);
      void mutate();
      toast("Removed from playlist.", "success");
    } catch {
      toast("Could not remove item.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <DetailHero
        type="playlist"
        id={playlist.id}
        artworkUrl={playlist.artwork_url}
        kicker={playlist.is_editorial ? "Editorial playlist" : playlist.is_owner ? "Your playlist" : "Playlist"}
        title={displayTitle(playlist, locale)}
        titleAlt={altTitle(playlist, locale)}
        subtitle={playlist.description ?? undefined}
        meta={
          <>
            {playlist.is_editorial ? (
              <span>Curated by Bangladesh Betar</span>
            ) : (
              <span>By {playlist.owner ?? "you"}</span>
            )}
            <span>· {playlist.items_count ?? tracks.length} items</span>
            {playlist.followers_count != null && <span>· {formatCount(playlist.followers_count)} followers</span>}
          </>
        }
        actions={
          <>
            {tracks.length > 0 && (
              <PlayCircle size="size-14" icon="size-6" onClick={() => playContext(tracks, 0, playlist.title)} label={`Play ${playlist.title}`} />
            )}
            {!isOwner && <FollowButton type="playlist" id={playlist.id} initial={playlist.is_following} />}
            {isOwner && (
              <>
                <button
                  onClick={() => {
                    setTitle(playlist.title);
                    setDescription(playlist.description ?? "");
                    setIsPublic(playlist.is_public ?? false);
                    setEditOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-full border border-edge-strong px-4 py-1.5 text-sm font-semibold transition hover:border-ink"
                >
                  <Pencil className="size-4" /> Edit
                </button>
                <button
                  onClick={removePlaylist}
                  className="flex items-center gap-2 rounded-full border border-edge-strong px-4 py-1.5 text-sm font-semibold text-danger transition hover:border-danger"
                >
                  <Trash2 className="size-4" /> Delete
                </button>
              </>
            )}
          </>
        }
      />

      {tracks.length === 0 ? (
        <EmptyState
          title="This playlist is empty"
          subtitle={isOwner ? "Find something you love and use “Add to playlist”." : "Nothing has been added yet."}
        />
      ) : (
        <TrackTable
          tracks={tracks}
          contextLabel={playlist.title}
          onRemove={isOwner ? removeItem : undefined}
        />
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit playlist">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-card border border-edge-strong bg-raised px-3 py-2 text-sm font-normal outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none rounded-card border border-edge-strong bg-raised px-3 py-2 text-sm font-normal outline-none focus:border-accent"
            />
          </label>
          <button
            onClick={() => setIsPublic((p) => !p)}
            className="flex items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-ink"
          >
            {isPublic ? <Globe2 className="size-4 text-accent" /> : <Lock className="size-4" />}
            {isPublic ? "Public — anyone with the link can view" : "Private — only you can view"}
          </button>
          <button
            onClick={saveEdit}
            disabled={!title.trim()}
            className="rounded-full bg-accent py-2.5 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-40"
          >
            Save changes
          </button>
        </div>
      </Modal>
    </div>
  );
}
