"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ProfileAvatar } from "@/src/modules/profiles/components/profile-avatar";
import type { ProfileSummary } from "@/src/modules/profiles/types";

export function ProfileMenu({ profile }: { profile: ProfileSummary }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const switchProfile = async () => {
    await fetch("/api/session", { method: "DELETE" }).catch(() => undefined);
    router.push("/profiles");
    router.refresh();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 items-center gap-2 rounded-full border border-border bg-background p-1 pr-2 text-sm font-medium shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <ProfileAvatar color={profile.avatarColor} initials={profile.initials} className="h-7 w-7 rounded-full text-[1.75rem]" />
        <span className="hidden max-w-24 truncate sm:block">{profile.name}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.isAdmin ? "Administrator" : "Profile"}</p>
          </div>
          <div className="my-1 border-t border-border" />
          <button
            role="menuitem"
            type="button"
            onClick={() => void switchProfile()}
            className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="h-4 w-4" /> Switch profile
          </button>
        </div>
      )}
    </div>
  );
}
