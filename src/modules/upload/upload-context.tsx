"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useUpload } from "@/src/modules/upload/hooks/use-upload";

type UploadContextValue = ReturnType<typeof useUpload>;

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const value = useUpload();

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
}

export function useUploadContext() {
  const context = useContext(UploadContext);

  if (!context) {
    throw new Error("useUploadContext must be used inside an UploadProvider.");
  }

  return context;
}
