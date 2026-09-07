"use client";

import { VideoCard } from "@/src/components/common/video-card";
import type { Video } from "@/src/modules/list/types";

type VideoGridProps = {
  videos: Video[];
};

export function VideoGrid({ videos }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-x-3.5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-3.5 xl:gap-y-5">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
