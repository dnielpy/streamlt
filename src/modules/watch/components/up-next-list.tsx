import Link from "next/link";
import { formatVideoTitle } from "@/lib/utils";
import { VideoThumbnail } from "@/src/components/common/video-thumbnail";
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
          <VideoLink key={video.id} video={video} />
        ))}
      </div>
    </aside>
  );
}

function VideoLink({ video }: { video: Video }) {
  const displayTitle = formatVideoTitle(video.title);

  return (
    <Link
      className="group flex min-w-0 gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      href={`/watch/${video.id}`}
    >
      <div className="relative aspect-video w-[145px] shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm sm:w-[180px] lg:w-[145px] xl:w-[160px]">
        <VideoThumbnail
          alt={displayTitle}
          sizes="(min-width: 1280px) 160px, (min-width: 1024px) 145px, 180px"
          src={video.thumbnailUrl}
        />
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-px text-[11px] font-bold leading-4 text-white">
          {video.duration}
        </span>
      </div>

      <div className="min-w-0 pt-0.5">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-[1.25] tracking-[-0.02em] text-card-foreground transition group-hover:text-foreground">
          {displayTitle}
        </h3>
        <p className="mt-1 text-[13px] leading-4 text-muted-foreground">
          {video.duration} <span aria-hidden="true">•</span> Modified {formatDate(video.modifiedAt)}
        </p>
      </div>
    </Link>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
