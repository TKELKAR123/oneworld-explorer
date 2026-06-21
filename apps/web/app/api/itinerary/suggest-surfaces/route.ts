import { suggestItineraryFixes } from "@oneworld-explorer/core";
import type { RouteSegment } from "@oneworld-explorer/core";
import { NextResponse } from "next/server";

interface SuggestBody {
  segments?: RouteSegment[];
}

export async function POST(request: Request) {
  let body: SuggestBody;
  try {
    body = (await request.json()) as SuggestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.segments?.length) {
    return NextResponse.json(
      { error: "segments array is required" },
      { status: 400 },
    );
  }

  const suggestions = suggestItineraryFixes(body.segments);
  return NextResponse.json({ suggestions });
}
