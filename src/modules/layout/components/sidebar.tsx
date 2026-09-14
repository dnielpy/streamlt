"use client";

import Link from "next/link";
import { House, Upload, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ProfileSummary } from "@/src/modules/profiles/types";

const baseNavigation = [
  { href: "/", label: "Home", icon: House },
  { href: "/upload", label: "Upload", icon: Upload },
];

export function Sidebar({ profile }: { profile: ProfileSummary | null }) {
  const pathname = usePathname();
  const navigation = profile?.isAdmin
    ? [...baseNavigation, { href: "/admin/profiles", label: "Profiles", icon: Users }]
    : baseNavigation;

  const links = navigation.map((item) => {
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-[10px] px-3.5 text-[14px] font-semibold transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        href={item.href}
      >
        <Icon className="h-[18px] w-[18px]" fill={item.href === "/" && active ? "currentColor" : "none"} strokeWidth={2.2} />
        {item.label}
      </Link>
    );
  });

  return (
    <>
      <aside className="hidden w-[200px] shrink-0 border-r border-border px-3 pt-2 lg:block">
        <nav aria-label="Primary navigation" className="grid gap-1 [&_a]:h-[38px]">
          {links}
        </nav>
      </aside>
      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid border-t border-border bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgb(0_0_0/0.06)] backdrop-blur lg:hidden [&_a]:mx-auto [&_a]:h-12 [&_a]:w-full [&_a]:max-w-36 [&_a]:justify-center [&_a]:gap-2 [&_a]:px-3"
        style={{ gridTemplateColumns: `repeat(${navigation.length}, minmax(0, 1fr))` }}
      >
        {links}
      </nav>
    </>
  );
}
