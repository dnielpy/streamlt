"use client";

import type { ReactNode } from "react";
import { AppBar } from "@/src/modules/layout/components/app-bar";
import { Sidebar } from "@/src/modules/layout/components/sidebar";

type AppLayoutViewProps = {
  children: ReactNode;
};

export function AppLayoutView({ children }: AppLayoutViewProps) {
  return (
    <div className="min-h-screen bg-white">
      <AppBar />
      <div className="flex min-h-[calc(100vh-76px)]">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 pb-7 pt-6 sm:px-6 lg:px-7 lg:pt-7">
          {children}
        </main>
      </div>
    </div>
  );
}
