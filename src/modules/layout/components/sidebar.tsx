"use client";

import { House } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-[200px] shrink-0 border-r border-slate-100 px-3 pt-2 lg:block">
      <nav aria-label="Primary navigation">
        <a
          className="flex h-[38px] items-center gap-3 rounded-[10px] bg-slate-100 px-3.5 text-[14px] font-semibold text-slate-900 transition hover:bg-slate-200"
          href="/list"
        >
          <House className="h-[18px] w-[18px] fill-current" strokeWidth={2.2} />
          Home
        </a>
      </nav>
    </aside>
  );
}
