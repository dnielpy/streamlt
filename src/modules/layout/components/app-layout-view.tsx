"use client";

import type { ReactNode } from "react";
import type { HomeServerIdentity } from "@home-server/contracts";
import { HomeServerShell } from "@home-server/shell";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { VideoSearch } from "@/src/modules/search/components/video-search";
import { MiniPlayer } from "@/src/modules/player/components/mini-player";
import { PersistentPlayerProvider } from "@/src/modules/player/contexts/persistent-player-context";

type AppLayoutViewProps = {
  children: ReactNode;
  identity: HomeServerIdentity | null;
};

export function AppLayoutView({ children, identity }: AppLayoutViewProps) {
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
        <HomeServerShell currentZone="streamlt" identity={identity} headerSlot={<VideoSearch />}>
          <div className="min-h-[calc(100vh-68px)]">
            <main
              className={`min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-7 ${
                isWatchView ? "lg:px-6 lg:pt-6" : "lg:px-7 lg:pt-7"
              }`}
            >
              {children}
            </main>
          </div>
          <MiniPlayer />
        </HomeServerShell>
      </PersistentPlayerProvider>
    </ThemeProvider>
  );
}
