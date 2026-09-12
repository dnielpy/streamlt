import { formatVideoTitle } from "@/lib/utils";
import { formatDate } from "@/src/modules/player/utils/date";
import type { Video } from "@/src/modules/list/types";
import { DownloadButton } from "@/src/modules/download/components/download-button";
import { UpNextList } from "@/src/modules/watch/components/up-next-list";
import { VideoPlayer } from "@/src/modules/watch/components/video-player";

type Props = {
  video: Video;
  upNext: Video[];
};

export function WatchView({ video, upNext }: Props) {
  const displayTitle = formatVideoTitle(video.title);

  return (
    <section className="mx-auto max-w-[1440px]" aria-label="Video player">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px] xl:gap-5">
        <div className="min-w-0 lg:sticky lg:top-[82px] lg:self-start">
          <VideoPlayer video={video} />

          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[23px] font-bold leading-tight tracking-[-0.04em] text-foreground sm:text-[26px]">
                {displayTitle}
              </h1>
              <p className="mt-2 text-[14px] text-muted-foreground">
                {video.duration} <span aria-hidden="true">•</span> Modified {formatDate(video.modifiedAt)}
              </p>
            </div>

            <DownloadButton streamUrl={video.streamUrl} />
          </div>
        </div>

        <UpNextList videos={upNext} />
      </div>
    </section>
  );
}
