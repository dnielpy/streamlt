import type { Video } from "@/src/modules/list/types";
import { UpNextList } from "@/src/modules/watch/components/up-next-list";
import { VideoPlayer } from "@/src/modules/watch/components/video-player";

type WatchViewProps = {
  video: Video;
  upNext: Video[];
};

export function WatchView({ video, upNext }: WatchViewProps) {
  return (
    <section className="mx-auto max-w-[1440px]" aria-label="Video player">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px] xl:gap-5">
        <div className="min-w-0 lg:sticky lg:top-[82px] lg:self-start">
          <VideoPlayer video={video} />

          <div className="mt-4">
            <h1 className="text-[23px] font-bold leading-tight tracking-[-0.04em] text-foreground sm:text-[26px]">
              {video.title}
            </h1>
            <p className="mt-2 text-[14px] text-muted-foreground">
              {video.views} <span aria-hidden="true">•</span> {video.publishedAt}
            </p>
          </div>
        </div>

        <UpNextList videos={upNext} />
      </div>
    </section>
  );
}
