"use client";

import { Expand, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { usePersistentPlayer } from "@/src/modules/player/contexts/persistent-player-context";
import { VideoPlayer } from "@/src/modules/watch/components/video-player";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

function subscribeToDesktopQuery(onChange: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

function getDesktopServerSnapshot() {
  return false;
}

export function MiniPlayer() {
  const pathname = usePathname();
  const { activeVideo, clearPlayer } = usePersistentPlayer();
  const isDesktop = useSyncExternalStore(subscribeToDesktopQuery, getDesktopSnapshot, getDesktopServerSnapshot);

  if (!isDesktop || !activeVideo || pathname.startsWith("/watch")) {
    return null;
  }

  return (
    <aside
      aria-label="Mini video player"
      className="fixed bottom-6 right-6 z-40 w-[360px] overflow-hidden rounded-xl border border-border bg-black shadow-2xl"
    >
      <VideoPlayer key={activeVideo.id} variant="mini" video={activeVideo} />
      <div className="absolute right-2 top-2 z-30 flex items-center gap-1">
        <Link
          aria-label="Open full video"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-sm transition hover:bg-black/85 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          href={`/watch/${activeVideo.id}`}
          title="Open full video"
        >
          <Expand aria-hidden="true" className="h-4 w-4" />
        </Link>
        <button
          aria-label="Close mini player"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-sm transition hover:bg-black/85 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          onClick={clearPlayer}
          title="Close mini player"
          type="button"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
