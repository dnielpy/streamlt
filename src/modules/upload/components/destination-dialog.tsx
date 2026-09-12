"use client";

import { Dialog } from "@base-ui/react/dialog";
import { FolderPlus, Library, X } from "lucide-react";
import { useUploadContext } from "@/src/modules/upload/upload-context";
import { formatBytes } from "@/src/modules/upload/utils/format-bytes";

export function DestinationDialog() {
  const {
    destination,
    setDestination: onDestinationChange,
    folderName,
    setFolderName: onFolderNameChange,
    fileCount,
    totalSize,
    clearFiles: onCancel,
    startUploads: onConfirm,
  } = useUploadContext();
  const open = fileCount > 0;

  const validFolderName = folderName.trim().length > 0 &&
    !folderName.trim().startsWith(".") &&
    !/[\\/\u0000-\u001f\u007f]/.test(folderName);
  const validDestination = destination === "root" || (destination === "folder" && validFolderName);

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
          <Dialog.Popup className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl outline-none transition data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <Dialog.Title className="text-xl font-semibold tracking-[-0.02em]">Choose a destination</Dialog.Title>
                <Dialog.Description className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {fileCount} {fileCount === 1 ? "video" : "videos"} · {formatBytes(totalSize)}
                </Dialog.Description>
              </div>
              <button type="button" aria-label="Close" onClick={onCancel} className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="size-5" />
              </button>
            </div>

            <form className="mt-6" onSubmit={(event) => { event.preventDefault(); if (validDestination) onConfirm(); }}>
              <fieldset className="grid gap-3">
                <legend className="sr-only">Upload destination</legend>
                <button
                  type="button"
                  onClick={() => onDestinationChange("root")}
                  aria-pressed={destination === "root"}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${destination === "root" ? "border-primary bg-primary/10" : "border-border hover:bg-muted/70"}`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-background text-foreground shadow-sm"><Library className="size-5" /></span>
                  <span>
                    <span className="block text-sm font-semibold">Library root</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">Store videos alongside your current library.</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDestinationChange("folder")}
                  aria-pressed={destination === "folder"}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${destination === "folder" ? "border-primary bg-primary/10" : "border-border hover:bg-muted/70"}`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-background text-foreground shadow-sm"><FolderPlus className="size-5" /></span>
                  <span>
                    <span className="block text-sm font-semibold">New subfolder</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">Create one folder inside the library.</span>
                  </span>
                </button>
              </fieldset>

              {destination === "folder" && (
                <div className="mt-4">
                  <label htmlFor="upload-folder-name" className="mb-2 block text-sm font-medium">Folder name</label>
                  <input
                    id="upload-folder-name"
                    autoFocus
                    value={folderName}
                    onChange={(event) => onFolderNameChange(event.target.value)}
                    placeholder="Summer collection"
                    maxLength={120}
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/30"
                  />
                  {!validFolderName && folderName.length > 0 && <p className="mt-2 text-xs text-red-600 dark:text-red-400">Use a simple folder name without slashes or a leading dot.</p>}
                </div>
              )}

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={onCancel} className="h-11 rounded-full px-5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Cancel</button>
                <button type="submit" disabled={!validDestination} className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45">Start upload</button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
