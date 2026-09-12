import type { Metadata } from "next";
import { ProfileManager } from "@/src/modules/profiles/components/profile-manager";
import { getProfileSummariesForAdmin } from "@/src/modules/profiles/server/profile-store";
import { requireAdminProfile } from "@/src/modules/profiles/server/session";

export const metadata: Metadata = {
  title: "Profiles · Streamlt",
  description: "Manage Streamlt profiles.",
};

export const dynamic = "force-dynamic";

export default async function AdminProfilesPage() {
  await requireAdminProfile();
  return <ProfileManager initialProfiles={await getProfileSummariesForAdmin()} />;
}
