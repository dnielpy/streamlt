"use client";

import { useCallback } from "react";

type DownloadableVideo = {
  streamUrl: string;
};

export function useDownload() {
  const download = useCallback((video: DownloadableVideo) => {
    const link = document.createElement("a");
    link.href = `${video.streamUrl}?download=1`;
    link.download = "";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  return { download };
}
