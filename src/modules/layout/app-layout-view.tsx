"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { AppBar } from "@/src/modules/layout/components/app-bar";
import { Sidebar } from "@/src/modules/layout/components/sidebar";

type AppLayoutViewProps = {
  children: ReactNode;
};

export function AppLayoutView({ children }: AppLayoutViewProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableSystem={false}
      storageKey="streamlt-theme"
    >
      <div className="min-h-screen bg-background">
        <AppBar />
        <div className="flex min-h-[calc(100vh-76px)]">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 pb-7 pt-6 sm:px-6 lg:px-7 lg:pt-7">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
