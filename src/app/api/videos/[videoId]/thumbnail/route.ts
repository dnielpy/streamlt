import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import {
  getVideoCachePath,
  getVideoCacheRoot,
  getVideoFileById,
} from "@/src/modules/library/server/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ThumbnailContext = {
  params: Promise<{ videoId: string }>;
};

function fallbackThumbnail() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="#171717"/><path d="M276 137h88v86h-88zM292 153v54l42-27z" fill="#737373"/><text x="320" y="260" fill="#a3a3a3" font-family="Arial,sans-serif" font-size="18" text-anchor="middle">No preview available</text></svg>`;

  return new Response(svg, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}

function generateThumbnail(inputPath: string, outputPath: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-ss",
        "1",
        "-i",
        inputPath,
        "-frames:v",
        "1",
        "-vf",
        "scale=640:-2",
        "-q:v",
        "4",
        "-y",
        outputPath,
      ],
      { stdio: "ignore" },
    );

    child.on("error", () => resolve(false));
    child.on("close", (exitCode) => resolve(exitCode === 0));
  });
}

export async function GET(_request: Request, context: ThumbnailContext) {
  const { videoId } = await context.params;
  const video = await getVideoFileById(videoId);

  if (!video) {
    return new Response("Video not found", { status: 404 });
  }

  const cachePath = getVideoCachePath(video);

  try {
    const image = await readFile(cachePath);

    return new Response(new Uint8Array(image), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "image/jpeg",
      },
    });
  } catch {
    // The thumbnail is generated below when it is not cached yet.
  }

  let temporaryPath: string | undefined;

  try {
    await mkdir(getVideoCacheRoot(), { recursive: true });
    temporaryPath = `${cachePath}.${randomUUID()}.tmp`;
    const generated = await generateThumbnail(video.absolutePath, temporaryPath);

    if (!generated) {
      await unlink(temporaryPath).catch(() => undefined);
      temporaryPath = undefined;
      return fallbackThumbnail();
    }

    await rename(temporaryPath, cachePath);
    const image = await readFile(cachePath);

    return new Response(new Uint8Array(image), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "image/jpeg",
      },
    });
  } catch {
    if (temporaryPath) {
      await unlink(temporaryPath).catch(() => undefined);
    }

    return fallbackThumbnail();
  }
}
