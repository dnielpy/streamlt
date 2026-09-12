import { NextResponse } from "next/server";
import { createProfile, ProfileStoreError } from "@/src/modules/profiles/server/profile-store";
import { getAuthenticatedProfile } from "@/src/modules/profiles/server/session";
import { hasValidOrigin } from "@/src/modules/profiles/server/request-security";
import type { ProfileAvatarColor } from "@/src/modules/profiles/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await getAuthenticatedProfile();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!session.isAdmin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  try {
    const body = await request.json() as { name?: unknown; pin?: unknown; avatarColor?: unknown };
    if (typeof body.name !== "string" || typeof body.pin !== "string" || typeof body.avatarColor !== "string") {
      return NextResponse.json({ error: "Name, PIN, and avatar are required." }, { status: 400 });
    }
    const profile = await createProfile({
      name: body.name,
      pin: body.pin,
      avatarColor: body.avatarColor as ProfileAvatarColor,
    });
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    const status = error instanceof ProfileStoreError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unable to create the profile.";
    return NextResponse.json({ error: message }, { status });
  }
}

