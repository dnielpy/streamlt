import { VideoCard } from "@/src/components/common/video-card";
import type { Video } from "@/src/modules/list/types";

type UpNextListProps = {
  videos: Video[];
};

export function UpNextList({ videos }: UpNextListProps) {
  return (
    <aside
      aria-labelledby="up-next-heading"
      className="min-w-0 lg:sticky lg:top-[82px] lg:self-start lg:pt-1"
    >
      <h2
        className="mb-4 text-[22px] font-bold tracking-[-0.04em] text-foreground"
        id="up-next-heading"
      >
        Up next
      </h2>

      <div className="space-y-2 lg:max-h-[calc(100vh-130px)] lg:overflow-y-auto lg:pr-2">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} variant="compact" />
        ))}
      </div>
    </aside>
  );
}
