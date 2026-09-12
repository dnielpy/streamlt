import type { ReactNode } from "react";
import { AppLayoutView } from "@/src/modules/layout/components/app-layout-view";
import { getAuthenticatedProfile } from "@/src/modules/profiles/server/session";

type AppLayoutContainerProps = {
  children: ReactNode;
};

export async function AppLayoutContainer({ children }: AppLayoutContainerProps) {
  const profile = await getAuthenticatedProfile();
  return <AppLayoutView profile={profile}>{children}</AppLayoutView>;
}
