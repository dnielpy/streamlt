import { Download } from "lucide-react";
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

          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[23px] font-bold leading-tight tracking-[-0.04em] text-foreground sm:text-[26px]">
                {video.title}
              </h1>
              <p className="mt-2 text-[14px] text-muted-foreground">
                {video.duration} <span aria-hidden="true">•</span> Modified {formatDate(video.modifiedAt)}
              </p>
            </div>

            <a
              aria-label="Download video"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              download
              href={`${video.streamUrl}?download=1`}
              title="Download video"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>

        <UpNextList videos={upNext} />
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
