import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import type { UploadQueueItem } from "@/src/modules/upload/types";

type UploadStatusIconProps = {
  status: UploadQueueItem["status"];
};

export function UploadStatusIcon({ status }: UploadStatusIconProps) {
  if (status === "complete") {
    return (
      <CheckCircle2
        aria-label="Upload complete"
        className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
      />
    );
  }

  if (status === "error") {
    return (
      <AlertCircle
        aria-label="Upload failed"
        className="size-5 shrink-0 text-red-600 dark:text-red-400"
      />
    );
  }

  if (status === "uploading") {
    return (
      <LoaderCircle
        aria-label="Uploading"
        className="size-5 shrink-0 animate-spin text-foreground"
      />
    );
  }

  return (
    <span
      aria-label="Queued"
      className="mt-1 size-2 shrink-0 rounded-full bg-muted-foreground/40"
    />
  );
}
