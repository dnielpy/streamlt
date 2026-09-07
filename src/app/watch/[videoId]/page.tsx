import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockVideos } from "@/src/modules/list/data/mock-videos";
import { WatchView } from "@/src/modules/watch/watch-view";

type WatchPageProps = {
  params: Promise<{ videoId: string }>;
};

function getVideo(videoId: string) {
  return mockVideos.find((video) => video.id === videoId);
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { videoId } = await params;
  const video = getVideo(videoId);

  if (!video) {
    return { title: "Video not found | Streamlt" };
  }

  return {
    title: `${video.title} | Streamlt`,
    description: `Watch ${video.title} on Streamlt.`,
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;
  const video = getVideo(videoId);

  if (!video) {
    notFound();
  }

  return <WatchView video={video} upNext={mockVideos.filter((item) => item.id !== video.id)} />;
}
