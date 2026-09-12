import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthenticatedProfile } from "@/src/modules/profiles/types";
import { getProfileRecord, getSessionSecret } from "@/src/modules/profiles/server/profile-store";
import { decodeSignedSession, encodeSignedSession } from "@/src/modules/profiles/server/session-codec";

const SESSION_COOKIE = "streamlt_session";

export async function createProfileSession(profileId: string, sessionVersion: number, secure: boolean) {
  const value = encodeSignedSession({ profileId, sessionVersion, issuedAt: Date.now() }, await getSessionSecret());
  (await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    priority: "high",
  });
}

export async function deleteProfileSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getAuthenticatedProfile(): Promise<AuthenticatedProfile | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = decodeSignedSession(value, await getSessionSecret());
  if (!payload) return null;
  const profile = await getProfileRecord(payload.profileId);
  if (!profile || profile.sessionVersion !== payload.sessionVersion) return null;

  return {
    id: profile.id,
    name: profile.name,
    avatarColor: profile.avatarColor,
    initials: profile.initials,
    isAdmin: profile.isAdmin,
    scope: {
      profileId: profile.id,
      isAdmin: profile.isAdmin,
      folderName: profile.folderName,
      key: profile.isAdmin ? "admin:all" : `profile:${profile.id}:${profile.sessionVersion}`,
    },
  };
}

export async function requireAuthenticatedProfile(nextPath = "/") {
  const profile = await getAuthenticatedProfile();
  if (!profile) redirect(`/profiles?next=${encodeURIComponent(nextPath)}`);
  return profile;
}

export async function requireAdminProfile(nextPath = "/admin/profiles") {
  const profile = await requireAuthenticatedProfile(nextPath);
  if (!profile.isAdmin) redirect("/");
  return profile;
}

export function isSafeNextPath(value: string | null | undefined) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/api/"));
}
