"use client";

import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/src/modules/list/types";

type VideoCardProps = {
  video: Video;
};

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link
      className="group block min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      href={`/watch/${video.id}`}
    >
      <article>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted shadow-sm">
          <Image
            alt={video.title}
            className="object-cover transition duration-300 group-hover:scale-[1.025]"
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            src={video.thumbnail}
          />
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-px text-[11px] font-bold leading-4 text-white">
            {video.duration}
          </span>
        </div>
        <div className="pt-2">
          <h2 className="line-clamp-2 text-[15px] font-semibold leading-[1.3] tracking-[-0.02em] text-card-foreground">
            {video.title}
          </h2>
          <p className="mt-0.5 text-[13px] leading-4 text-muted-foreground">
            {video.views} <span aria-hidden="true">•</span> {video.publishedAt}
          </p>
        </div>
      </article>
    </Link>
  );
}
