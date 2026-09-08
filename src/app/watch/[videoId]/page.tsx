import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatVideoTitle } from "@/lib/utils";
import { getVideoById, listVideos } from "@/src/modules/library/server/library";
import { WatchView } from "@/src/modules/watch/watch-view";

export const dynamic = "force-dynamic";

type WatchPageProps = {
  params: Promise<{ videoId: string }>;
};

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { videoId } = await params;
  const video = await getVideoById(videoId);

  if (!video) {
    return { title: "Video not found | Streamlt" };
  }

  const displayTitle = formatVideoTitle(video.title);

  return {
    title: `${displayTitle} | Streamlt`,
    description: `Watch ${displayTitle} on Streamlt.`,
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;
  const video = await getVideoById(videoId);

  if (!video) {
    notFound();
  }

  const upNext = await listVideos({ limit: 12, excludeId: video.id });

  return <WatchView video={video} upNext={upNext.items} />;
}
