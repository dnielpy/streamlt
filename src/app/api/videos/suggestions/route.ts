import { NextResponse } from "next/server";
import { suggestVideoTitles } from "@/src/modules/library/server/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    return NextResponse.json({ suggestions: await suggestVideoTitles(query) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load search suggestions.";

    return NextResponse.json({ error: message, suggestions: [] }, { status: 500 });
  }
}
