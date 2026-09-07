"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VideoGrid } from "@/src/modules/list/components/video-grid";
import type { Video, VideoPage } from "@/src/modules/list/types";

type VideoListViewProps = {
  initialVideos: Video[];
  initialCursor: string | null;
  query: string;
  error?: string;
};

export function VideoListView({ initialVideos, initialCursor, query, error }: VideoListViewProps) {
  const [videos, setVideos] = useState(initialVideos);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setLoadError(null);

    try {
      const params = new URLSearchParams({ cursor: nextCursor, limit: "12" });

      if (query) {
        params.set("q", query);
      }

      const response = await fetch(`/api/videos?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Unable to load more videos.");
      }

      const page = (await response.json()) as VideoPage;
      setVideos((currentVideos) => [...currentVideos, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (loadMoreError) {
      setLoadError(loadMoreError instanceof Error ? loadMoreError.message : "Unable to load more videos.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [nextCursor, query]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !nextCursor) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, nextCursor]);

  const emptyMessage = query ? "No videos matched your search." : "No videos were found in the library.";

  return (
    <section aria-label="Video list" className="mx-auto max-w-[1200px]">
      {error ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="font-semibold text-card-foreground">Video library unavailable</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="font-semibold text-card-foreground">{emptyMessage}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {query ? "Try a different search term." : "Set VIDEO_LIBRARY_PATH to a folder containing MP4 or WebM files."}
          </p>
        </div>
      ) : (
        <>
          <VideoGrid videos={videos} />
          <div className="flex min-h-16 items-center justify-center" ref={sentinelRef}>
            {isLoading && <p className="text-sm text-muted-foreground">Loading more videos…</p>}
            {!nextCursor && <p className="text-sm text-muted-foreground">You’ve reached the end of the library.</p>}
            {loadError && (
              <button className="text-sm font-semibold text-foreground underline" onClick={() => void loadMore()} type="button">
                {loadError} Try again.
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
