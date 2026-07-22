"use client";

import { ListMusic, Plus } from "lucide-react";
import { useState } from "react";
import { useSWRConfig } from "swr";
import Modal from "@/components/ui/Modal";
import { post } from "@/lib/api";
import { useMyPlaylists } from "@/lib/hooks";
import { useUi } from "@/stores/ui";

export default function AddToPlaylistModal() {
  const { addToPlaylistTrack: track, closeAddToPlaylist, toast } = useUi();
  const { data: playlists, mutate: refreshPlaylists } = useMyPlaylists();
  const { mutate } = useSWRConfig();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const addTo = async (playlistId: number, playlistTitle: string) => {
    if (!track || busy) return;
    setBusy(true);
    try {
      await post(`/me/playlists/${playlistId}/items`, {
        playable_type: track.type === "episode" || track.type === "story" ? "audio_asset" : track.type,
        playable_id: track.type === "episode" || track.type === "story" ? track.assetId : track.id,
      });
      toast(`Added to “${playlistTitle}”.`, "success");
      void mutate((key) => Array.isArray(key) && String(key[0]).startsWith("/me/playlists"), undefined, { revalidate: true });
      closeAddToPlaylist();
    } catch {
      toast("Could not add to playlist.", "error");
    } finally {
      setBusy(false);
    }
  };

  const createAndAdd = async () => {
    if (!newTitle.trim() || busy) return;
    setBusy(true);
    try {
      const res = await post<{ data: { id: number; title: string } }>("/me/playlists", { title: newTitle.trim() });
      await refreshPlaylists();
      setCreating(false);
      setNewTitle("");
      setBusy(false);
      await addTo(res.data.id, res.data.title);
    } catch {
      toast("Could not create playlist.", "error");
      setBusy(false);
    }
  };

  return (
    <Modal open={track !== null} onClose={closeAddToPlaylist} title="Add to playlist">
      {track && (
        <div className="flex flex-col gap-2">
          <p className="clamp-1 text-sm text-ink-soft">
            Adding: <span className="font-semibold text-ink">{track.title}</span>
          </p>

          <div className="max-h-64 overflow-y-auto">
            {(playlists?.data ?? []).map((p) => (
              <button
                key={p.id}
                disabled={busy}
                onClick={() => addTo(p.id, p.title)}
                className="flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-left text-sm font-medium transition hover:bg-highlight disabled:opacity-50"
              >
                <ListMusic className="size-4.5 text-ink-mute" />
                <span className="clamp-1 flex-1">{p.title}</span>
                <span className="text-xs text-ink-mute">{p.items_count ?? 0} items</span>
              </button>
            ))}
            {playlists && !playlists.data.length && !creating && (
              <p className="px-3 py-4 text-center text-sm text-ink-mute">No playlists yet.</p>
            )}
          </div>

          {creating ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createAndAdd()}
                placeholder="Playlist name"
                className="flex-1 rounded-card border border-edge-strong bg-raised px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={createAndAdd}
                disabled={!newTitle.trim() || busy}
                className="rounded-card bg-accent px-4 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-40"
              >
                Create
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center justify-center gap-2 rounded-card border border-dashed border-edge-strong py-2.5 text-sm font-semibold text-ink-soft transition hover:border-accent hover:text-accent"
            >
              <Plus className="size-4" /> New playlist
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
