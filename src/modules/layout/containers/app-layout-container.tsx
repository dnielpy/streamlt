import type { ReactNode } from "react";
import { AppLayoutView } from "@/src/modules/layout/app-layout-view";

type AppLayoutContainerProps = {
  children: ReactNode;
};

export function AppLayoutContainer({ children }: AppLayoutContainerProps) {
  return <AppLayoutView>{children}</AppLayoutView>;
}
