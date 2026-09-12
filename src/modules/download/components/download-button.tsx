"use client";

import { Download } from "lucide-react";
import { useDownload } from "@/src/modules/download/hooks/use-download";

type DownloadButtonProps = {
  streamUrl: string;
};

export function DownloadButton({ streamUrl }: DownloadButtonProps) {
  const { download } = useDownload();

  return (
    <button
      type="button"
      aria-label="Download video"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      onClick={() => download({ streamUrl })}
      title="Download video"
    >
      <Download aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
