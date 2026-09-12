import { notFound } from "next/navigation";
import { getVideoById, listVideos } from "@/src/modules/library/server/library";
import { WatchView } from "@/src/modules/watch/components/watch-view";

export const dynamic = "force-dynamic";

type WatchPageProps = {
  params: Promise<{ videoId: string }>;
};

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;
  const video = await getVideoById(videoId);

  if (!video) {
    notFound();
  }

  const upNext = await listVideos({ limit: 12, excludeId: video.id });

  return <WatchView video={video} upNext={upNext.items} />;
}
