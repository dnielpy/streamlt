import { NextResponse } from "next/server";
import { listVideos } from "@/src/modules/library/server/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Number.parseInt(searchParams.get("limit") ?? "12", 10);

  try {
    return NextResponse.json(await listVideos({ query, cursor, limit }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to scan the video library.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
