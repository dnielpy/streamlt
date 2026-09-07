"use client";

import Link from "next/link";
import { House } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-[200px] shrink-0 border-r border-border px-3 pt-2 lg:block">
      <nav aria-label="Primary navigation">
        <Link
          className="flex h-[38px] items-center gap-3 rounded-[10px] bg-muted px-3.5 text-[14px] font-semibold text-foreground transition hover:bg-accent"
          href="/"
        >
          <House className="h-[18px] w-[18px] fill-current" strokeWidth={2.2} />
          Home
        </Link>
      </nav>
    </aside>
  );
}
