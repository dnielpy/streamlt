"use client";

import Link from "next/link";
import { formatVideoTitle } from "@/lib/utils";
import { VideoThumbnail } from "@/src/components/common/video-thumbnail";
import type { Video } from "@/src/modules/list/types";

type VideoCardProps = {
  video: Video;
  variant?: "grid" | "compact";
};

export function VideoCard({ video, variant = "grid" }: VideoCardProps) {
  const displayTitle = formatVideoTitle(video.title);
  const isCompact = variant === "compact";

  return (
    <Link
      className="group block min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      href={`/watch/${video.id}`}
    >
      <article className={isCompact ? "flex min-w-0 gap-3" : undefined}>
        <div
          className={
            isCompact
              ? "relative aspect-video w-[145px] shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm sm:w-[180px] lg:w-[145px] xl:w-[160px]"
              : "relative aspect-video overflow-hidden rounded-lg bg-muted shadow-sm"
          }
        >
          <VideoThumbnail
            alt={displayTitle}
            sizes={
              isCompact
                ? "(min-width: 1280px) 160px, (min-width: 1024px) 145px, 180px"
                : "(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            }
            src={video.thumbnailUrl}
          />
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-px text-[11px] font-bold leading-4 text-white">
            {video.duration}
          </span>
        </div>
        <div className={isCompact ? "min-w-0 pt-0.5" : "pt-2"}>
          {isCompact ? (
            <h3 className="line-clamp-2 text-[14px] font-semibold leading-[1.25] tracking-[-0.02em] text-card-foreground transition group-hover:text-foreground">
              {displayTitle}
            </h3>
          ) : (
            <h2 className="line-clamp-2 text-[15px] font-semibold leading-[1.3] tracking-[-0.02em] text-card-foreground">
              {displayTitle}
            </h2>
          )}
          <p
            className={
              isCompact
                ? "mt-1 text-[13px] leading-4 text-muted-foreground"
                : "mt-0.5 text-[13px] leading-4 text-muted-foreground"
            }
          >
            {video.duration} <span aria-hidden="true">•</span> Modified {formatDate(video.modifiedAt)}
          </p>
        </div>
      </article>
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
