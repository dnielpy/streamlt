import { UploadView } from "@/src/modules/upload/components/upload-view";
import { listProfileSummaries } from "@/src/modules/profiles/server/profile-store";
import { requireAuthenticatedProfile } from "@/src/modules/profiles/server/session";

export async function UploadContainer() {
  const profile = await requireAuthenticatedProfile("/upload");
  const targetProfiles = profile.isAdmin
    ? (await listProfileSummaries()).filter((candidate) => !candidate.isAdmin).map(({ id, name }) => ({ id, name }))
    : [];
  return <UploadView isAdmin={profile.isAdmin} targetProfiles={targetProfiles} />;
}
