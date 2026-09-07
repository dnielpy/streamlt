import { DEFAULT_YOUTUBE_VIDEO_ID } from "@/src/modules/list/data/mock-videos";
import type { Video } from "@/src/modules/list/types";

type VideoPlayerProps = {
  video: Video;
};

export function VideoPlayer({ video }: VideoPlayerProps) {
  const youtubeId = video.youtubeId ?? DEFAULT_YOUTUBE_VIDEO_ID;

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-sm">
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
        title={`${video.title} video player`}
      />
    </div>
  );
}
