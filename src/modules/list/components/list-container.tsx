import { VideoListView } from "@/src/modules/list/components/video-list-view";
import type { VideoPage } from "@/src/modules/list/types";
import { listVideos } from "@/src/modules/library/server/library";

type ListContainerProps = {
  query: string;
};

export async function ListContainer({ query }: ListContainerProps) {
  let page: VideoPage | null = null;
  let errorMessage: string | undefined;

  try {
    page = await listVideos({ query });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Unable to load the video library.";
  }

  return (
    <VideoListView
      error={errorMessage}
      initialCursor={page?.nextCursor ?? null}
      initialVideos={page?.items ?? []}
      query={query}
    />
  );
}
