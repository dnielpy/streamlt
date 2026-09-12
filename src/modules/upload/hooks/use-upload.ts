"use client";

import { useEffect, useRef, useState } from "react";
import type { UploadDestination, UploadQueueItem, UploadResponse, UploadResult } from "@/src/modules/upload/types";

const UPLOAD_CONCURRENCY = 3;

export function createUploadQueueId() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `upload-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useUpload() {
  const [destination, setDestination] = useState<UploadDestination>("root");
  const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<UploadQueueItem[]>([]);
  const requests = useRef(new Map<string, XMLHttpRequest>());

  useEffect(() => () => {
    for (const request of requests.current.values()) request.abort();
  }, []);

  const updateUpload = (id: string, patch: Partial<UploadQueueItem>) => {
    setUploads((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const chooseFiles = (nextFiles: File[]) => {
    if (nextFiles.length === 0) return;
    setDestination("root");
    setFolderName("");
    setFiles(nextFiles);
  };

  const clearFiles = () => setFiles([]);

  const uploadFile = (item: UploadQueueItem, selectedFolder: string | null) => new Promise<void>((resolve) => {
    const request = new XMLHttpRequest();
    requests.current.set(item.id, request);
    updateUpload(item.id, { status: "uploading" });
    request.open("POST", "/api/upload");
    request.setRequestHeader("X-File-Name", encodeURIComponent(item.file.name));
    if (selectedFolder) request.setRequestHeader("X-Folder-Name", encodeURIComponent(selectedFolder));
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) updateUpload(item.id, { progress: Math.min(99, Math.round((event.loaded / event.total) * 100)) });
    });
    request.addEventListener("load", () => {
      requests.current.delete(item.id);
      let response: UploadResponse;
      try {
        response = JSON.parse(request.responseText) as UploadResponse;
      } catch {
        response = { error: "The server returned an invalid response." };
      }
      if (request.status >= 200 && request.status < 300 && "fileName" in response) {
        updateUpload(item.id, { status: "complete", progress: 100, storedFileName: (response as UploadResult).fileName });
      } else {
        updateUpload(item.id, { status: "error", error: "error" in response ? response.error : "Upload failed." });
      }
      resolve();
    });
    request.addEventListener("error", () => {
      requests.current.delete(item.id);
      updateUpload(item.id, { status: "error", error: "The connection was interrupted." });
      resolve();
    });
    request.addEventListener("abort", () => resolve());
    request.send(item.file);
  });

  const uploadFiles = (filesToUpload: File[], selectedFolder: string | null = null) => {
    if (filesToUpload.length === 0) return;

    const queued = filesToUpload.map<UploadQueueItem>((file) => ({
      id: createUploadQueueId(),
      file,
      progress: 0,
      status: "queued",
    }));
    setUploads((current) => [...queued, ...current]);

    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < queued.length) {
        const item = queued[nextIndex];
        nextIndex += 1;
        await uploadFile(item, selectedFolder);
      }
    };
    void Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, queued.length) }, worker));
  };

  const startUploads = () => {
    const selectedFolder = destination === "folder" ? folderName.trim() : null;
    uploadFiles(files, selectedFolder);
    clearFiles();
  };

  const clearCompleted = () => {
    setUploads((current) => current.filter((item) => item.status === "uploading" || item.status === "queued"));
  };

  return {
    destination,
    setDestination,
    folderName,
    setFolderName,
    fileCount: files.length,
    totalSize: files.reduce((total, file) => total + file.size, 0),
    chooseFiles,
    clearFiles,
    uploads,
    startUploads,
    clearCompleted,
  };
}
