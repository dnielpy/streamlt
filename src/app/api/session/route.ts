import { NextResponse } from "next/server";
import { createProfileSession, deleteProfileSession } from "@/src/modules/profiles/server/session";
import { getProfileRecord, verifyProfilePin } from "@/src/modules/profiles/server/profile-store";
import { hasValidOrigin } from "@/src/modules/profiles/server/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  try {
    const body = await request.json() as { profileId?: unknown; pin?: unknown };
    if (typeof body.profileId !== "string" || typeof body.pin !== "string") {
      return NextResponse.json({ error: "Profile and PIN are required." }, { status: 400 });
    }
    const profile = await getProfileRecord(body.profileId);
    if (!profile || !(await verifyProfilePin(profile, body.pin))) {
      return NextResponse.json({ error: "Incorrect PIN. Please try again." }, { status: 401 });
    }
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
    const secure = forwardedProtocol ? forwardedProtocol === "https" : new URL(request.url).protocol === "https:";
    await createProfileSession(profile.id, profile.sessionVersion, secure);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  await deleteProfileSession();
  return NextResponse.json({ ok: true });
}
