import { constants, createWriteStream } from "node:fs";
import { access, copyFile, link, lstat, mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { pipeline } from "node:stream/promises";
import { getLibraryRoot } from "@/src/modules/library/server/library";
import type { UploadResult } from "@/src/modules/upload/types";
import { getProfileRecord } from "@/src/modules/profiles/server/profile-store";
import type { LibraryScope } from "@/src/modules/profiles/types";

const MAX_NAME_BYTES = 240;
const MAX_COLLISION_ATTEMPTS = 10_000;
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);

export class UploadError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "UploadError";
  }
}

function validateSegment(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "." || trimmed === "..") throw new UploadError(`${label} is required.`);
  if (/[\\/\u0000-\u001f\u007f]/.test(trimmed)) throw new UploadError(`${label} contains unsupported characters.`);
  if (Buffer.byteLength(trimmed, "utf8") > MAX_NAME_BYTES) throw new UploadError(`${label} is too long.`);
  return trimmed;
}

export function validateVideoFileName(value: string) {
  const fileName = validateSegment(value, "File name");
  if (!VIDEO_EXTENSIONS.has(path.extname(fileName).toLowerCase())) {
    throw new UploadError("Only MP4 and WebM videos can be uploaded.", 415);
  }
  return fileName;
}

export function validateFolderName(value: string | null | undefined) {
  if (value === null || value === undefined || value.trim() === "") return null;
  const folderName = validateSegment(value, "Folder name");
  if (folderName.startsWith(".")) throw new UploadError("Folder name cannot start with a dot.");
  return folderName;
}

async function getDestinationDirectory(scope: LibraryScope, targetProfileId: string | null, folderName: string | null) {
  const root = getLibraryRoot();
  let baseDirectory = root;

  if (scope.isAdmin && targetProfileId) {
    const targetProfile = await getProfileRecord(targetProfileId);
    if (!targetProfile || targetProfile.isAdmin || !targetProfile.folderName) {
      throw new UploadError("The selected profile is unavailable.", 404);
    }
    baseDirectory = path.join(root, targetProfile.folderName);
  } else if (!scope.isAdmin) {
    if (targetProfileId) throw new UploadError("You cannot upload to another profile.", 403);
    if (!scope.folderName) throw new UploadError("Profile library directory is unavailable.", 500);
    baseDirectory = path.join(root, scope.folderName);
  }

  let rootStats;
  try {
    rootStats = scope.isAdmin && !targetProfileId ? await stat(baseDirectory) : await lstat(baseDirectory);
  } catch {
    throw new UploadError("The configured video library directory is unavailable.", 500);
  }
  if (!rootStats.isDirectory() || (!(scope.isAdmin && !targetProfileId) && rootStats.isSymbolicLink())) {
    throw new UploadError("The selected profile directory is unavailable.", 500);
  }
  try {
    await access(root, constants.W_OK);
  } catch {
    throw new UploadError("The video library is not writable.", 500);
  }

  if (!folderName) return baseDirectory;
  const destination = path.join(baseDirectory, folderName);
  try {
    await mkdir(destination);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
  const destinationStats = await lstat(destination);
  if (!destinationStats.isDirectory() || destinationStats.isSymbolicLink()) {
    throw new UploadError("The selected folder name is not an available directory.");
  }
  return destination;
}

function candidateName(fileName: string, collisionIndex: number) {
  if (collisionIndex === 0) return fileName;
  const extension = path.extname(fileName);
  return `${path.basename(fileName, extension)} (${collisionIndex})${extension}`;
}

async function publishWithoutOverwrite(temporaryPath: string, directory: string, fileName: string) {
  for (let index = 0; index < MAX_COLLISION_ATTEMPTS; index += 1) {
    const storedName = candidateName(fileName, index);
    const destinationPath = path.join(directory, storedName);
    try {
      await link(temporaryPath, destinationPath);
      return storedName;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "EEXIST") continue;
      if (!["EPERM", "ENOSYS", "EOPNOTSUPP", "EXDEV"].includes(code ?? "")) throw error;
    }
    try {
      await copyFile(temporaryPath, destinationPath, constants.COPYFILE_EXCL);
      return storedName;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") continue;
      throw error;
    }
  }
  throw new UploadError("Unable to choose an available file name.", 409);
}

export async function saveUpload({
  body,
  fileName: rawFileName,
  folderName: rawFolderName,
  targetProfileId = null,
  scope,
}: {
  body: ReadableStream<Uint8Array> | null;
  fileName: string;
  folderName?: string | null;
  targetProfileId?: string | null;
  scope: LibraryScope;
}): Promise<UploadResult> {
  const fileName = validateVideoFileName(rawFileName);
  const folderName = validateFolderName(rawFolderName);
  const directory = await getDestinationDirectory(scope, targetProfileId, folderName);
  const temporaryPath = path.join(directory, `.streamlt-upload-${randomUUID()}.part`);

  try {
    if (body) {
      await pipeline(
        Readable.fromWeb(body as unknown as NodeReadableStream),
        createWriteStream(temporaryPath, { flags: "wx" }),
      );
    } else {
      await writeFile(temporaryPath, new Uint8Array(), { flag: "wx" });
    }
    const uploadedStats = await stat(temporaryPath);
    const storedName = await publishWithoutOverwrite(temporaryPath, directory, fileName);
    return { fileName: storedName, folderName, size: uploadedStats.size };
  } catch (error) {
    if (error instanceof UploadError) throw error;
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOSPC") throw new UploadError("There is not enough space to store this video.", 507);
    if (code === "EACCES" || code === "EPERM" || code === "EROFS") {
      throw new UploadError("The video library is not writable.", 500);
    }
    throw new UploadError("The video could not be stored.", 500);
  } finally {
    await unlink(temporaryPath).catch(() => undefined);
  }
}
