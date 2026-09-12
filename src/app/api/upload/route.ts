import { NextResponse } from "next/server";
import { clearLibraryCaches } from "@/src/modules/library/server/library";
import { saveUpload, UploadError } from "@/src/modules/upload/server/save-upload";
import { getAuthenticatedProfile } from "@/src/modules/profiles/server/session";
import { hasValidOrigin } from "@/src/modules/profiles/server/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function decodeHeader(value: string, label: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new UploadError(`${label} is invalid.`);
  }
}

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const profile = await getAuthenticatedProfile();
  if (!profile) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const encodedFileName = request.headers.get("x-file-name");
  if (!encodedFileName) return NextResponse.json({ error: "File name is required." }, { status: 400 });

  try {
    const encodedFolderName = request.headers.get("x-folder-name");
    const targetProfileId = request.headers.get("x-target-profile-id");
    const result = await saveUpload({
      body: request.body,
      fileName: decodeHeader(encodedFileName, "File name"),
      folderName: encodedFolderName ? decodeHeader(encodedFolderName, "Folder name") : null,
      targetProfileId,
      scope: profile.scope,
    });
    clearLibraryCaches();
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const status = error instanceof UploadError ? error.status : 500;
    const message = error instanceof Error ? error.message : "The video could not be stored.";
    return NextResponse.json({ error: message }, { status });
  }
}
