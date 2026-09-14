import type { ReactNode } from "react";
import { parseHomeServerIdentity } from "@home-server/contracts";
import { headers } from "next/headers";
import { AppLayoutView } from "@/src/modules/layout/components/app-layout-view";

type AppLayoutContainerProps = {
  children: ReactNode;
};

export async function AppLayoutContainer({ children }: AppLayoutContainerProps) {
  return <AppLayoutView identity={parseHomeServerIdentity(await headers())}>{children}</AppLayoutView>;
}
