"use client";

import { ListMusic, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ListenPageHero from "@/components/cards/ListenPageHero";
import Artwork from "@/components/ui/Artwork";
import Modal from "@/components/ui/Modal";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { post } from "@/lib/api";
import { localizedText, useTranslation } from "@/lib/i18n";
import { useMyPlaylists } from "@/lib/hooks";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

/** Dedicated "Playlists" page — reached from the sidebar (which no longer lists
 *  every playlist inline). Lists all of the listener's playlists. */
export default function PlaylistsPage() {
  const { locale, t } = useTranslation();
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);
  const { data: playlists, isLoading, mutate } = useMyPlaylists();
  const router = useRouter();
  const toast = useUi((s) => s.toast);

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [busy, setBusy] = useState(false);

  const createPlaylist = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      const res = await post<{ data: { id: number } }>("/me/playlists", { title: title.trim(), title_bn: titleBn.trim() || null });
      toast(t("libraryPages.playlistCreated"), "success");
      setCreateOpen(false);
      setTitle("");
      setTitleBn("");
      void mutate();
      router.push(`/playlists/${res.data.id}`);
    } catch {
      toast(t("libraryPages.playlistCreateFailed"), "error");
    } finally {
      setBusy(false);
    }
  };

  if (hydrated && !token) {
    return (
      <div className="flex flex-col gap-10">
        <ListenPageHero title={t("libraryPages.playlistHero")} description={t("libraryPages.playlistHeroDescription")} icon={<ListMusic className="size-3.5" />} />
        <EmptyState
          icon={<ListMusic className="size-10" />}
          title={t("libraryPages.playlistSignInTitle")}
          subtitle={t("libraryPages.playlistSignInDescription")}
          action={<Link href="/login" className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover">{t("libraryPages.signIn")}</Link>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <ListenPageHero
        title={t("libraryPages.playlistHero")}
        description={t("libraryPages.playlistHeroDescription")}
        icon={<ListMusic className="size-3.5" />}
        meta={playlists?.data.length != null ? t("libraryPages.savedPlaylists", { count: playlists.data.length }) : undefined}
        actions={<button
          onClick={() => setCreateOpen(true)}
          className="flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-accent-fg shadow-lg shadow-[var(--accent-glow)] transition hover:-translate-y-0.5 hover:bg-accent-hover"
        >
          <Plus className="size-4" /> {t("libraryPages.newPlaylist")}
        </button>}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 min-[520px]:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square w-full" />
            </div>
          ))}
        </div>
      ) : (playlists?.data.length ?? 0) === 0 ? (
        <EmptyState
          icon={<ListMusic className="size-10" />}
          title={t("libraryPages.noPlaylists")}
          subtitle={t("libraryPages.noPlaylistsDescription")}
          action={
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-fg transition hover:bg-accent-hover"
            >
              {t("libraryPages.newPlaylist")}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-5 min-[520px]:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {playlists!.data.map((p) => (
            <Link
              key={p.id}
              href={`/playlists/${p.id}`}
              className="group flex min-w-0 flex-col gap-3 rounded-panel border border-edge bg-raised/65 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-edge-strong hover:bg-raised hover:shadow-xl"
            >
              <Artwork type="playlist" id={p.id} url={p.artwork_url} title={localizedText(p as unknown as Record<string, unknown>, "title", locale)} className="aspect-square w-full shadow-lg shadow-shade/25" />
              <div>
                <p className="clamp-1 text-sm font-semibold">{localizedText(p as unknown as Record<string, unknown>, "title", locale)}</p>
                <p className="text-xs text-ink-mute">{t("libraryPages.items", { count: p.items_count ?? 0 })}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t("libraryPages.newPlaylist")}>
        <div className="flex flex-col gap-4">
          <label className="text-sm font-semibold">{t("libraryPages.titleEnglish")}<input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
            placeholder={t("libraryPages.playlistPlaceholder")}
            className="mt-1.5 w-full rounded-card border border-edge-strong bg-raised px-4 py-2.5 text-sm font-normal outline-none focus:border-accent"
          /></label>
          <label className="text-sm font-semibold">{t("libraryPages.titleBangla")}<input
            value={titleBn}
            onChange={(e) => setTitleBn(e.target.value)}
            className="mt-1.5 w-full rounded-card border border-edge-strong bg-raised px-4 py-2.5 text-sm font-normal outline-none focus:border-accent"
          /></label>
          <button
            onClick={createPlaylist}
            disabled={!title.trim() || busy}
            className="rounded-full bg-accent py-2.5 text-sm font-bold text-accent-fg transition enabled:hover:bg-accent-hover disabled:opacity-40"
          >
            {t("libraryPages.createPlaylist")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
