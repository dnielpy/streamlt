import { NextResponse } from "next/server";
import { DownloadManagerError, queueProfileDownload } from "@/src/modules/download/server/download-manager";
import { getAuthenticatedProfile } from "@/src/modules/profiles/server/session";
import { hasValidOrigin } from "@/src/modules/profiles/server/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  const profile = await getAuthenticatedProfile();
  if (!profile) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const body = (await request.json()) as { url?: unknown };
    const download = await queueProfileDownload(body.url, profile.scope.folderName ?? "");
    return NextResponse.json({ download }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const status = error instanceof DownloadManagerError ? error.status : 500;
    const message = error instanceof Error ? error.message : "The download could not be added.";
    return NextResponse.json({ error: message }, { status });
  }
}
