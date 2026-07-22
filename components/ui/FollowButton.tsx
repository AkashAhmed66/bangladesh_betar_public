"use client";

import { useState } from "react";
import { post } from "@/lib/api";
import type { FollowableType } from "@/lib/types";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

interface FollowButtonProps {
  type: FollowableType;
  id: number;
  initial?: boolean;
  className?: string;
}

export default function FollowButton({ type, id, initial = false, className = "" }: FollowButtonProps) {
  const token = useAuth((s) => s.token);
  const openLogin = useUi((s) => s.openLoginPrompt);
  const toast = useUi((s) => s.toast);
  const [following, setFollowing] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);

  // Adjust when the server-provided flag changes (e.g. after sign-in).
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setFollowing(initial);
  }

  const toggle = async () => {
    if (!token) {
      openLogin("Sign in to follow and get updates in your library.");
      return;
    }
    setFollowing((f) => !f);
    try {
      const res = await post<{ following: boolean }>("/me/follows/toggle", {
        followable_type: type,
        followable_id: id,
      });
      setFollowing(res.following);
    } catch {
      setFollowing((f) => !f);
      toast("Could not update follows.", "error");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={following}
      className={`rounded-full border px-5 py-1.5 text-sm font-semibold transition ${
        following
          ? "border-accent text-accent hover:border-danger hover:text-danger"
          : "border-edge-strong text-ink hover:border-ink hover:scale-[1.02]"
      } ${className}`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
