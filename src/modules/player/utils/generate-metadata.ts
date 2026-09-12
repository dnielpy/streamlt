import type { Metadata } from "next";
import { getVideoById } from "../../library/server/library";
import { formatVideoTitle } from "@/lib/utils";

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
