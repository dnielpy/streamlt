import { headers } from "next/headers";
import { parseHomeServerIdentity } from "@home-server/contracts";
import { redirect } from "next/navigation";
import type { AuthenticatedProfile } from "@/src/modules/profiles/types";

export async function getAuthenticatedProfile(): Promise<AuthenticatedProfile | null> {
  const identity = parseHomeServerIdentity(await headers());
  if (identity) {
    return {
      id: identity.workspaceId,
      name: identity.workspaceName,
      avatarColor: "blue",
      initials: identity.workspaceName.slice(0, 2).toUpperCase(),
      isAdmin: false,
      scope: {
        profileId: identity.workspaceId,
        isAdmin: false,
        folderName: `${identity.workspaceFolder}/streamlt`,
        key: `home-server:${identity.workspaceId}`,
      },
    };
  }
  return null;
}

export async function requireAuthenticatedProfile(nextPath = "/") {
  const profile = await getAuthenticatedProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(`/streamlt${nextPath === "/" ? "" : nextPath}`)}`);
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
