import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import {
  getVideoFileById,
  getVideoFileName,
  getVideoMimeType,
} from "@/src/modules/library/server/library";
import { getAuthenticatedProfile } from "@/src/modules/profiles/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StreamContext = {
  params: Promise<{ videoId: string }>;
};

function contentDisposition(fileName: string, download: boolean) {
  const asciiName = fileName.replace(/[^ -~]/g, "_").replace(/"/g, "'");

  return `${download ? "attachment" : "inline"}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

function parseRange(range: string | null, fileSize: number) {
  if (!range) {
    return { start: 0, end: fileSize - 1 };
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);

  if (!match) {
    return null;
  }

  const [, startText, endText] = match;
  const start = startText ? Number.parseInt(startText, 10) : fileSize - Number.parseInt(endText, 10);
  let end = endText ? Number.parseInt(endText, 10) : fileSize - 1;

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= fileSize) {
    return null;
  }

  end = Math.min(end, fileSize - 1);
  return { start, end };
}

async function handleMediaRequest(request: Request, context: StreamContext, includeBody: boolean) {
  const profile = await getAuthenticatedProfile();
  if (!profile) return new Response("Authentication required", { status: 401 });
  const { videoId } = await context.params;
  const video = await getVideoFileById(profile.scope, videoId);

  if (!video) {
    return new Response("Video not found", { status: 404 });
  }

  let fileStats;

  try {
    fileStats = await stat(video.absolutePath);
  } catch {
    return new Response("Video not found", { status: 404 });
  }

  if (fileStats.size === 0) {
    return new Response("Video is empty", {
      status: 416,
      headers: {
        "Content-Range": "bytes */0",
      },
    });
  }

  const range = parseRange(request.headers.get("range"), fileStats.size);

  if (!range) {
    return new Response("Invalid range", {
      status: 416,
      headers: {
        "Content-Range": `bytes */${fileStats.size}`,
      },
    });
  }

  const isPartial = Boolean(request.headers.get("range"));
  const contentLength = range.end - range.start + 1;
  const download = new URL(request.url).searchParams.get("download") === "1";
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=0, must-revalidate",
    "Content-Disposition": contentDisposition(getVideoFileName(video.absolutePath), download),
    "Content-Length": String(contentLength),
    "Content-Type": getVideoMimeType(video.absolutePath),
  });

  if (isPartial) {
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${fileStats.size}`);
  }

  if (!includeBody) {
    return new Response(null, { status: isPartial ? 206 : 200, headers });
  }

  const fileStream = createReadStream(video.absolutePath, {
    start: range.start,
    end: range.end,
  });

  return new Response(Readable.toWeb(fileStream) as ReadableStream, {
    status: isPartial ? 206 : 200,
    headers,
  });
}

export async function GET(request: Request, context: StreamContext) {
  return handleMediaRequest(request, context, true);
}

export async function HEAD(request: Request, context: StreamContext) {
  return handleMediaRequest(request, context, false);
}
