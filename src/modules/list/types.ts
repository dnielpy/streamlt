export type Video = {
  id: string;
  title: string;
  duration: string;
  modifiedAt: string;
  folder: string;
  size: number;
  streamUrl: string;
  thumbnailUrl: string;
};

export type VideoPage = {
  items: Video[];
  nextCursor: string | null;
};
