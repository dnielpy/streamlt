"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { AppBar } from "@/src/modules/layout/components/app-bar";
import { Sidebar } from "@/src/modules/layout/components/sidebar";
import { MiniPlayer } from "@/src/modules/player/components/mini-player";
import { PersistentPlayerProvider } from "@/src/modules/player/contexts/persistent-player-context";
import type { ProfileSummary } from "@/src/modules/profiles/types";

type AppLayoutViewProps = {
  children: ReactNode;
  profile: ProfileSummary | null;
};

export function AppLayoutView({ children, profile }: AppLayoutViewProps) {
  const pathname = usePathname();
  const isProfileSelector = pathname === "/profiles";
  const isWatchView = pathname.startsWith("/watch");

  if (isProfileSelector) return children;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableSystem={false}
      storageKey="streamlt-theme"
    >
      <PersistentPlayerProvider>
        <div className="min-h-screen bg-background">
          <AppBar profile={profile} />
          <div className="flex min-h-[calc(100vh-76px)]">
            {!isWatchView && <Sidebar profile={profile} />}
            <main
              className={`min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-7 ${
                isWatchView ? "lg:px-6 lg:pt-6" : "lg:px-7 lg:pt-7"
              }`}
            >
              {children}
            </main>
          </div>
          <MiniPlayer />
        </div>
      </PersistentPlayerProvider>
    </ThemeProvider>
  );
}
