"use client";

import { VideoGrid } from "@/src/modules/list/components/video-grid";
import type { Video } from "@/src/modules/list/types";

type VideoListViewProps = {
  videos: Video[];
};

export function VideoListView({ videos }: VideoListViewProps) {
  return (
    <section aria-label="Video list" className="mx-auto max-w-[1200px]">
      <VideoGrid videos={videos} />
    </section>
  );
}
