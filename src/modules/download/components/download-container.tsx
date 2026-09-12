import { DownloadView } from "@/src/modules/download/components/download-view";
import { getDownloadManagerPublicUrl } from "@/src/modules/download/server/download-manager";
import { requireAuthenticatedProfile } from "@/src/modules/profiles/server/session";

export async function DownloadContainer() {
  const profile = await requireAuthenticatedProfile("/download");
  const destinationLabel = profile.isAdmin ? "Admin library root" : `${profile.name}'s library`;

  return (
    <DownloadView
      destinationLabel={destinationLabel}
      managerUrl={getDownloadManagerPublicUrl()}
    />
  );
}
