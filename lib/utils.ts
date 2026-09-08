export { cn } from "cn"

const YTDOWN_YOUTUBE_PREFIX = "YTDown.com_YouTube_";

export function formatVideoTitle(title: string) {
  const titleWithoutPrefix = title.startsWith(YTDOWN_YOUTUBE_PREFIX)
    ? title.slice(YTDOWN_YOUTUBE_PREFIX.length)
    : title;

  return titleWithoutPrefix.replace(/_Media.*$/, "").replaceAll("-", " ");
}
