"use client";

import type { ReactNode } from "react";
import { UploadContext } from "@/src/modules/upload/contexts/upload-context";
import { useUpload } from "@/src/modules/upload/hooks/use-upload";
import type { UploadTargetProfile } from "@/src/modules/upload/types";

type UploadProviderProps = {
  children: ReactNode;
  isAdmin: boolean;
  targetProfiles: UploadTargetProfile[];
};

export function UploadProvider({ children, isAdmin, targetProfiles }: UploadProviderProps) {
  const value = useUpload({ isAdmin, targetProfiles });

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
}
