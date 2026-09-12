"use client";

import { createContext } from "react";
import type { useUpload } from "@/src/modules/upload/hooks/use-upload";

export type UploadContextValue = ReturnType<typeof useUpload>;

export const UploadContext = createContext<UploadContextValue | null>(null);
