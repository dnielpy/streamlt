import { notFound } from "next/navigation";
import { getVideoById, listVideos } from "@/src/modules/library/server/library";
import { WatchView } from "@/src/modules/watch/components/watch-view";
import { requireAuthenticatedProfile } from "@/src/modules/profiles/server/session";

export const dynamic = "force-dynamic";

type WatchPageProps = {
  params: Promise<{ videoId: string }>;
};

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;
  const profile = await requireAuthenticatedProfile(`/watch/${videoId}`);
  const video = await getVideoById(profile.scope, videoId);

  if (!video) {
    notFound();
  }

  const upNext = await listVideos({ scope: profile.scope, limit: 12, excludeId: video.id });

  return <WatchView video={video} upNext={upNext.items} />;
}
