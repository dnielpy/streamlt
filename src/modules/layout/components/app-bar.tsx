"use client";

import Image from "next/image";
import Link from "next/link";
import { VideoSearch } from "@/src/modules/search/components/video-search";
import { ThemeToggle } from "@/src/modules/layout/components/theme-toggle";
import { ProfileMenu } from "@/src/modules/layout/components/profile-menu";
import type { ProfileSummary } from "@/src/modules/profiles/types";

export function AppBar({ profile }: { profile: ProfileSummary | null }) {
  return (
    <header className="sticky top-0 z-20 grid h-[66px] grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background/95 px-4 backdrop-blur sm:px-7 lg:px-10">
      <Link
        className="flex shrink-0 items-center gap-2 text-[21px] font-bold tracking-[-0.07em] text-foreground"
        href="/"
        aria-label="Streamlt home"
      >
        <Image
          src="/streamlt-logo.svg"
          alt=""
          width={36}
          height={36}
          priority
          className="h-7 w-7 shadow-sm"
        />
        Streamlt
      </Link>

      <VideoSearch />

      <div className="col-start-3 ml-auto flex items-center gap-2">
        <ThemeToggle />
        {profile && <ProfileMenu profile={profile} />}
      </div>
    </header>
  );
}
