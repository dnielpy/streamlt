import { NextResponse } from "next/server";
import { deleteProfile, ProfileStoreError, updateProfile } from "@/src/modules/profiles/server/profile-store";
import { getAuthenticatedProfile } from "@/src/modules/profiles/server/session";
import { hasValidOrigin } from "@/src/modules/profiles/server/request-security";
import type { ProfileAvatarColor } from "@/src/modules/profiles/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProfileContext = { params: Promise<{ profileId: string }> };

async function authorize(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await getAuthenticatedProfile();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  return null;
}

export async function PATCH(request: Request, context: ProfileContext) {
  const unauthorized = await authorize(request);
  if (unauthorized) return unauthorized;
  try {
    const { profileId } = await context.params;
    const body = await request.json() as { name?: unknown; pin?: unknown; avatarColor?: unknown };
    if (typeof body.name !== "string" || typeof body.avatarColor !== "string" || (body.pin !== undefined && typeof body.pin !== "string")) {
      return NextResponse.json({ error: "Name and avatar are required." }, { status: 400 });
    }
    const profile = await updateProfile(profileId, {
      name: body.name,
      pin: body.pin,
      avatarColor: body.avatarColor as ProfileAvatarColor,
    });
    return NextResponse.json({ profile });
  } catch (error) {
    const status = error instanceof ProfileStoreError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unable to update the profile.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request, context: ProfileContext) {
  const unauthorized = await authorize(request);
  if (unauthorized) return unauthorized;
  try {
    const { profileId } = await context.params;
    const profile = await deleteProfile(profileId);
    return NextResponse.json({ profile });
  } catch (error) {
    const status = error instanceof ProfileStoreError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unable to delete the profile.";
    return NextResponse.json({ error: message }, { status });
  }
}
