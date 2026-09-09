import { createHash, randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import type { Video, VideoPage } from "@/src/modules/list/types";

const PAGE_SIZE = 12;
const SNAPSHOT_TTL_MS = 10 * 60 * 1000;
const SUPPORTED_EXTENSIONS = new Set([".mp4", ".webm"]);

type VideoFile = {
  id: string;
  absolutePath: string;
  relativePath: string;
  title: string;
  folder: string;
  size: number;
  modifiedAtMs: number;
};

type LibrarySnapshot = {
  id: string;
  query: string;
  createdAt: number;
  files: VideoFile[];
};

type CursorPayload = {
  snapshotId: string;
  offset: number;
  query: string;
  excludeId?: string;
};

type ListVideosOptions = {
  query?: string;
  cursor?: string;
  limit?: number;
  excludeId?: string;
};

const snapshots = new Map<string, LibrarySnapshot>();
const durationCache = new Map<string, { size: number; modifiedAtMs: number; seconds: number | null }>();

export function getLibraryRoot() {
  const configuredPath = process.env.VIDEO_LIBRARY_PATH?.trim();

  if (!configuredPath) {
    throw new Error("VIDEO_LIBRARY_PATH is not configured.");
  }

  return path.resolve(configuredPath);
}

function getCacheRoot() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.VIDEO_CACHE_PATH?.trim() || ".streamlt-cache");
}

function createVideoId(relativePath: string) {
  return createHash("sha256").update(relativePath).digest("hex").slice(0, 32);
}

function encodeCursor(payload: CursorPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const payload = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as CursorPayload;

    if (
      typeof payload.snapshotId !== "string" ||
      typeof payload.offset !== "number" ||
      !Number.isInteger(payload.offset) ||
      payload.offset < 0 ||
      typeof payload.query !== "string"
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function cleanupSnapshots() {
  const now = Date.now();

  for (const [id, snapshot] of snapshots) {
    if (now - snapshot.createdAt > SNAPSHOT_TTL_MS) {
      snapshots.delete(id);
    }
  }
}

async function walkDirectory(root: string, currentDirectory: string, files: VideoFile[]) {
  let entries;

  try {
    entries = await readdir(currentDirectory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const absolutePath = path.join(currentDirectory, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(root, absolutePath, files);
      continue;
    }

    if (!entry.isFile() || !SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }

    try {
      const fileStats = await stat(absolutePath);
      const relativePath = path.relative(root, absolutePath);
      const parsedPath = path.parse(relativePath);
      const relativeFolder = path.dirname(relativePath);

      files.push({
        id: createVideoId(relativePath),
        absolutePath,
        relativePath,
        title: parsedPath.name,
        folder: relativeFolder === "." ? "Library" : relativeFolder,
        size: fileStats.size,
        modifiedAtMs: fileStats.mtimeMs,
      });
    } catch {
      // A file can disappear or become inaccessible while the library is scanned.
    }
  }
}

async function scanLibrary(query: string, excludeId?: string) {
  const root = getLibraryRoot();
  const files: VideoFile[] = [];

  try {
    const rootStats = await stat(root);

    if (!rootStats.isDirectory()) {
      throw new Error("VIDEO_LIBRARY_PATH must point to a directory.");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "VIDEO_LIBRARY_PATH must point to a directory.") {
      throw error;
    }

    throw new Error(`Video library directory not found: ${root}`);
  }

  await walkDirectory(root, root, files);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredFiles = files
    .filter((file) => {
      if (!normalizedQuery) {
        return true;
      }

      return `${file.title} ${file.relativePath}`.toLocaleLowerCase().includes(normalizedQuery);
    })
    .filter((file) => file.id !== excludeId)
    .sort((first, second) => {
      if (second.modifiedAtMs !== first.modifiedAtMs) {
        return second.modifiedAtMs - first.modifiedAtMs;
      }

      return first.relativePath.localeCompare(second.relativePath);
    });

  return filteredFiles;
}

async function createSnapshot(query: string, excludeId?: string) {
  cleanupSnapshots();

  const snapshot: LibrarySnapshot = {
    id: randomUUID(),
    query,
    createdAt: Date.now(),
    files: await scanLibrary(query, excludeId),
  };

  snapshots.set(snapshot.id, snapshot);
  return snapshot;
}

function findVideoInSnapshots(videoId: string) {
  cleanupSnapshots();

  for (const snapshot of snapshots.values()) {
    const file = snapshot.files.find((candidate) => candidate.id === videoId);

    if (file) {
      return file;
    }
  }

  return null;
}

function formatDuration(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) {
    return "—";
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function runCommand(command: string, args: string[]) {
  return new Promise<string>((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "ignore"] });
    let output = "";

    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on("error", () => resolve(""));
    child.on("close", (exitCode) => resolve(exitCode === 0 ? output.trim() : ""));
  });
}

async function getDuration(file: VideoFile) {
  const cached = durationCache.get(file.id);

  if (cached && cached.size === file.size && cached.modifiedAtMs === file.modifiedAtMs) {
    return cached.seconds;
  }

  const output = await runCommand("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    file.absolutePath,
  ]);
  const parsedDuration = Number.parseFloat(output);
  const seconds = Number.isFinite(parsedDuration) ? parsedDuration : null;

  durationCache.set(file.id, { size: file.size, modifiedAtMs: file.modifiedAtMs, seconds });
  return seconds;
}

async function serializeVideo(file: VideoFile): Promise<Video> {
  const duration = await getDuration(file);

  return {
    id: file.id,
    title: file.title,
    duration: formatDuration(duration),
    modifiedAt: new Date(file.modifiedAtMs).toISOString(),
    folder: file.folder,
    size: file.size,
    streamUrl: `/api/videos/${file.id}/stream`,
    thumbnailUrl: `/api/videos/${file.id}/thumbnail`,
  };
}

export async function listVideos({ query = "", cursor, limit = PAGE_SIZE, excludeId }: ListVideosOptions = {}): Promise<VideoPage> {
  const safeLimit = Math.min(Math.max(Math.floor(limit) || PAGE_SIZE, 1), PAGE_SIZE);
  const decodedCursor = cursor ? decodeCursor(cursor) : null;
  let snapshot: LibrarySnapshot | undefined;
  let offset = 0;
  let effectiveQuery = query.trim();
  let effectiveExcludeId = excludeId;

  if (decodedCursor) {
    snapshot = snapshots.get(decodedCursor.snapshotId);
    offset = decodedCursor.offset;
    effectiveQuery = decodedCursor.query;
    effectiveExcludeId = decodedCursor.excludeId;
  }

  if (!snapshot) {
    snapshot = await createSnapshot(effectiveQuery, effectiveExcludeId);
    offset = 0;
  }

  const pageFiles = snapshot.files.slice(offset, offset + safeLimit);
  const items = await Promise.all(pageFiles.map(serializeVideo));
  const nextOffset = offset + pageFiles.length;
  const nextCursor = nextOffset < snapshot.files.length
    ? encodeCursor({
        snapshotId: snapshot.id,
        offset: nextOffset,
        query: snapshot.query,
        excludeId: effectiveExcludeId,
      })
    : null;

  return { items, nextCursor };
}

export async function getVideoFileById(videoId: string) {
  const cachedFile = findVideoInSnapshots(videoId);

  if (cachedFile) {
    return cachedFile;
  }

  const snapshot = await createSnapshot("");
  return snapshot.files.find((file) => file.id === videoId) ?? null;
}

export async function getVideoById(videoId: string) {
  const file = await getVideoFileById(videoId);

  return file ? serializeVideo(file) : null;
}

export function getVideoCachePath(video: Pick<VideoFile, "id" | "size" | "modifiedAtMs">) {
  const cacheKey = `${video.id}-${video.size}-${Math.floor(video.modifiedAtMs)}`;
  return path.join(getCacheRoot(), `${cacheKey}.jpg`);
}

export function getVideoCacheRoot() {
  return getCacheRoot();
}

export function getVideoMimeType(filePath: string) {
  return path.extname(filePath).toLowerCase() === ".webm" ? "video/webm" : "video/mp4";
}

export function getVideoFileName(filePath: string) {
  return path.basename(filePath);
}

export function clearLibraryCaches() {
  snapshots.clear();
  durationCache.clear();
}
