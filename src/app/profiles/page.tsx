import type { Metadata } from "next";
import { ProfileSelector } from "@/src/modules/profiles/components/profile-selector";
import { listProfileSummaries } from "@/src/modules/profiles/server/profile-store";
import { isSafeNextPath } from "@/src/modules/profiles/server/session";

export const metadata: Metadata = {
  title: "Who's watching? · Streamlt",
  description: "Choose a Streamlt profile.",
};

export const dynamic = "force-dynamic";

type ProfilesPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function ProfilesPage({ searchParams }: ProfilesPageProps) {
  const params = await searchParams;
  const requestedNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = isSafeNextPath(requestedNext) ? requestedNext! : "/";
  return <ProfileSelector profiles={await listProfileSummaries()} nextPath={nextPath} />;
}

