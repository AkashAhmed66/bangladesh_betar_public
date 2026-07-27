import { WifiOff } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-raised text-ink-mute">
        <WifiOff className="size-8" />
      </span>
      <h1 className="font-display text-2xl font-bold">You’re offline</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        No connection right now. Your downloaded recordings are still available to play.
      </p>
      <Link
        href="/downloads"
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-fg transition hover:scale-105"
      >
        Go to Downloads
      </Link>
    </div>
  );
}
