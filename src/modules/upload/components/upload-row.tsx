import { FileVideo } from "lucide-react";
import { UploadStatusIcon } from "@/src/modules/upload/components/upload-status-icon";
import type { UploadQueueItem } from "@/src/modules/upload/types";
import { formatBytes } from "@/src/modules/upload/utils/format-bytes";

type UploadRowProps = {
  item: UploadQueueItem;
};

export function UploadRow({ item }: UploadRowProps) {
  const title = item.storedFileName ?? item.file.name;
  const statusText =
    item.status === "complete"
      ? "Uploaded"
      : item.status === "error"
        ? item.error ?? "Upload failed"
        : item.status === "queued"
          ? "Waiting"
          : `${item.progress}%`;

  return (
    <div className="flex gap-3 border-b border-border p-4 last:border-b-0 sm:items-center">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
        <FileVideo className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" title={title}>
              {title}
            </p>
            <p
              className={`mt-0.5 truncate text-xs ${
                item.status === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              {statusText} · {formatBytes(item.file.size)}
            </p>
          </div>
          <UploadStatusIcon status={item.status} />
        </div>
        {(item.status === "uploading" || item.status === "queued") && (
          <div
            aria-label={`Uploading ${item.file.name}`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={item.progress}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-150"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
