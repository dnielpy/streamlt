"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/src/modules/layout/components/theme-toggle";

export function AppBar() {
  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center gap-5 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-7 lg:px-10 relative">
      <Link
        className="flex shrink-0 items-center gap-2 text-[22px] font-bold tracking-[-0.07em] text-foreground"
        href="/"
        aria-label="Streamlt home"
      >
        <Image
          src="/streamlt-logo.svg"
          alt=""
          width={40}
          height={40}
          priority
          className="h-8 w-8 shadow-sm"
        />
        Streamlt
      </Link>

      <label className="absolute left-1/2 top-1/2 hidden w-[calc(100vw-18rem)] max-w-[600px] -translate-x-1/2 -translate-y-1/2 md:block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-foreground" />
        <input
          aria-label="Search videos"
          className="h-[38px] w-full rounded-full border border-input bg-background pl-12 pr-4 text-[14px] text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          placeholder="Search videos, channels, and more..."
          type="search"
        />
      </label>

      <ThemeToggle />
    </header>
  );
}
