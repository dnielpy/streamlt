"use client";

import type { ReactNode } from "react";
import { UploadContext } from "@/src/modules/upload/contexts/upload-context";
import { useUpload } from "@/src/modules/upload/hooks/use-upload";

type UploadProviderProps = {
  children: ReactNode;
};

export function UploadProvider({ children }: UploadProviderProps) {
  const value = useUpload();

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
}
