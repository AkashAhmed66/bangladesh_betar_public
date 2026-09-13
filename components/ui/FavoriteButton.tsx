"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { post } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";
import { useTranslation } from "@/lib/i18n";

interface FavoriteButtonProps {
  type: string;       // favoritable_type (usually audio_asset)
  id: number;
  initial?: boolean;
  className?: string;
  size?: string;
}

export default function FavoriteButton({ type, id, initial = false, className = "", size = "size-4.5" }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const token = useAuth((s) => s.token);
  const openLogin = useUi((s) => s.openLoginPrompt);
  const toast = useUi((s) => s.toast);
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!token) {
      openLogin(t("actions.signInFavourite"));
      return;
    }
    if (busy) return;
    setBusy(true);
    setFav((f) => !f);
    try {
      const res = await post<{ favorited: boolean }>("/me/favorites/toggle", {
        favoritable_type: type,
        favoritable_id: id,
      });
      setFav(res.favorited);
    } catch {
      setFav((f) => !f);
      toast(t("actions.favouriteFailed"), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={fav ? t("actions.removeFavourite") : t("actions.addFavourite")}
      aria-pressed={fav}
      className={`transition-colors ${fav ? "text-accent" : "text-ink-mute hover:text-ink"} ${className}`}
    >
      <Heart className={`${size} ${fav ? "fill-current" : ""}`} />
    </button>
  );
}
