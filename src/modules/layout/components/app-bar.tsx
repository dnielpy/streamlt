"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/src/modules/layout/components/theme-toggle";

export function AppBar() {
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

      <label className="relative hidden w-[calc(100vw-19rem)] max-w-[560px] justify-self-center md:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
        <input
          aria-label="Search videos"
          className="h-9 w-full rounded-full border border-input bg-background pl-11 pr-4 text-[14px] text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          placeholder="Search videos, channels, and more..."
          type="search"
        />
      </label>

      <ThemeToggle />
    </header>
  );
}
