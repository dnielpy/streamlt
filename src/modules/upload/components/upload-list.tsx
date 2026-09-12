"use client";

import { UploadRow } from "@/src/modules/upload/components/upload-row";
import { useUploadContext } from "@/src/modules/upload/hooks/use-upload-context";

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
        {items.map((item) => (
          <UploadRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
