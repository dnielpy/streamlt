import type { ReactNode } from "react";
import { AppLayoutView } from "@/src/modules/layout/components/app-layout-view";

type AppLayoutContainerProps = {
  children: ReactNode;
};

export function AppLayoutContainer({ children }: AppLayoutContainerProps) {
  return <AppLayoutView>{children}</AppLayoutView>;
}
