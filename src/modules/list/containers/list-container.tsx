import { VideoListView } from "@/src/modules/list/video-list-view";
import { mockVideos } from "@/src/modules/list/data/mock-videos";

export function ListContainer() {
  return <VideoListView videos={mockVideos} />;
}
