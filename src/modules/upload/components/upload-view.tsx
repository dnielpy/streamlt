"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DestinationDialog } from "@/src/modules/upload/components/destination-dialog";
import { UploadDropzone } from "@/src/modules/upload/components/upload-dropzone";
import { UploadList } from "@/src/modules/upload/components/upload-list";
import { createUploadQueueId } from "@/src/modules/upload/hooks/use-upload";
import { UploadProvider } from "@/src/modules/upload/components/upload-provider";

export { createUploadQueueId };

export function UploadView() {
  return (
    <UploadProvider>
      <div className="mx-auto w-full max-w-6xl px-0 sm:px-1">
        <div className="mb-6 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Library</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Upload videos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Add videos from this device to your local library.</p>
          </div>
          <Link href="/" className="hidden h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex">
            <ArrowLeft className="size-4" /> View library
          </Link>
        </div>

        <UploadDropzone />
        <UploadList />
        <DestinationDialog />
      </div>
    </UploadProvider>
  );
}
