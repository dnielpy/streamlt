"use client";

import { AlertCircle, CheckCircle2, FileVideo, LoaderCircle } from "lucide-react";
import type { UploadQueueItem } from "@/src/modules/upload/types";
import { useUploadContext } from "@/src/modules/upload/upload-context";
import { formatBytes } from "@/src/modules/upload/utils/format-bytes";

export function UploadList() {
  const { uploads: items, clearCompleted: onClearCompleted } = useUploadContext();

  if (items.length === 0) return null;

  const completeCount = items.filter((item) => item.status === "complete").length;
  const activeCount = items.filter((item) => item.status === "uploading" || item.status === "queued").length;

  return (
    <section className="mt-8" aria-labelledby="upload-queue-title">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 id="upload-queue-title" className="text-base font-semibold">Uploads</h2>
          <p className="mt-0.5 text-xs text-muted-foreground" aria-live="polite">
            {activeCount > 0 ? `${activeCount} remaining` : `${completeCount} completed`}
          </p>
        </div>
        {activeCount === 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            className="rounded-full px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear list
          </button>
        )}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((item) => <UploadRow key={item.id} item={item} />)}
      </div>
    </section>
  );
}

function UploadRow({ item }: { item: UploadQueueItem }) {
  const title = item.storedFileName ?? item.file.name;
  const statusText = item.status === "complete"
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
            <p className="truncate text-sm font-medium" title={title}>{title}</p>
            <p className={`mt-0.5 truncate text-xs ${item.status === "error" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
              {statusText} · {formatBytes(item.file.size)}
            </p>
          </div>
          <StatusIcon status={item.status} />
        </div>
        {(item.status === "uploading" || item.status === "queued") && (
          <div
            role="progressbar"
            aria-label={`Uploading ${item.file.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={item.progress}
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div className="h-full rounded-full bg-primary transition-[width] duration-150" style={{ width: `${item.progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: UploadQueueItem["status"] }) {
  if (status === "complete") return <CheckCircle2 aria-label="Upload complete" className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />;
  if (status === "error") return <AlertCircle aria-label="Upload failed" className="size-5 shrink-0 text-red-600 dark:text-red-400" />;
  if (status === "uploading") return <LoaderCircle aria-label="Uploading" className="size-5 shrink-0 animate-spin text-foreground" />;
  return <span className="mt-1 size-2 shrink-0 rounded-full bg-muted-foreground/40" aria-label="Queued" />;
}
