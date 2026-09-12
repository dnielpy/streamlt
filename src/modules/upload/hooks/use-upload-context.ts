"use client";

import { useContext } from "react";
import { UploadContext } from "@/src/modules/upload/contexts/upload-context";

export function useUploadContext() {
  const context = useContext(UploadContext);

  if (!context) {
    throw new Error("useUploadContext must be used inside an UploadProvider.");
  }

  return context;
}
