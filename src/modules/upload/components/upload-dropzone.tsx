"use client";

import { CloudUpload, FolderOpen } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useUploadContext } from "@/src/modules/upload/upload-context";

export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { chooseFiles } = useUploadContext();

  const selectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    chooseFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const dropFiles = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    chooseFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={dropFiles}
      className={`relative grid min-h-72 place-items-center rounded-3xl border-2 border-dashed p-8 text-center transition sm:min-h-80 ${
        dragging
          ? "scale-[1.005] border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/60 hover:bg-muted/30"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,.mp4,.webm"
        multiple
        className="sr-only"
        onChange={selectFiles}
        aria-label="Choose videos to upload"
      />
      <div className="pointer-events-none">
        <div className={`mx-auto grid size-20 place-items-center rounded-full transition ${dragging ? "bg-background text-foreground shadow-lg" : "bg-primary/10 text-foreground"}`}>
          <CloudUpload className="size-9" strokeWidth={1.8} />
        </div>
        <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em]">{dragging ? "Drop videos to continue" : "Drag videos here"}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Upload MP4 or WebM videos from this device. You will choose the destination before uploading.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="pointer-events-auto mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FolderOpen className="size-4" />
          Choose videos
        </button>
      </div>
    </div>
  );
}
