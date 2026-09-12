import type { Metadata } from "next";
import { getVideoById } from "../../library/server/library";
import { formatVideoTitle } from "@/lib/utils";
import { getAuthenticatedProfile } from "@/src/modules/profiles/server/session";

type WatchPageProps = {
    params: Promise<{ videoId: string }>;
};

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
    const { videoId } = await params;
    const profile = await getAuthenticatedProfile();
    const video = profile ? await getVideoById(profile.scope, videoId) : null;

    if (!video) {
        return { title: "Video not found | Streamlt" };
    }

    const displayTitle = formatVideoTitle(video.title);

    return {
        title: `${displayTitle} | Streamlt`,
        description: `Watch ${displayTitle} on Streamlt.`,
    };
}
