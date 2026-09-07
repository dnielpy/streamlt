"use client";

import Image from "next/image";
import { Play, Search } from "lucide-react";

export function AppBar() {
  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center gap-5 border-b border-slate-100 bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-10">
      <a
        className="flex shrink-0 items-center gap-2 text-[22px] font-bold tracking-[-0.07em] text-slate-950"
        href="/list"
        aria-label="LocalTube home"
      >
        <span className="flex h-8 w-9 items-center justify-center rounded-[10px] bg-red-600 text-white shadow-sm">
          <Play className="ml-0.5 h-[18px] w-[18px] fill-current" strokeWidth={2.8} />
        </span>
        Streamlt
      </a>

      <label className="relative mx-auto hidden w-full max-w-[600px] md:block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-900" />
        <input
          aria-label="Search videos"
          className="h-[38px] w-full rounded-full border border-slate-300 bg-white pl-12 pr-4 text-[14px] text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          placeholder="Search videos, channels, and more..."
          type="search"
        />
      </label>
    </header>
  );
}
