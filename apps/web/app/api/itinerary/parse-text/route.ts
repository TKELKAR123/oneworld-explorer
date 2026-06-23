import { formatRouteText, parseRouteText } from "@oneworld-explorer/core";
import { NextResponse } from "next/server";

interface ParseTextBody {
  text?: string;
  mergeMode?: "replace";
}

export async function POST(request: Request) {
  let body: ParseTextBody;
  try {
    body = (await request.json()) as ParseTextBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.text ?? "";
  if (!text.trim()) {
    return NextResponse.json(
      { stops: [], legTypes: [], stopIntents: [], parseIssues: [], formatted: "" },
      { status: 200 },
    );
  }

  const parsed = parseRouteText(text);
  return NextResponse.json({
    stops: parsed.stops,
    legTypes: parsed.legTypes,
    stopIntents: parsed.stopIntents,
    parseIssues: parsed.parseIssues,
    formatted: formatRouteText(parsed.stops, parsed.legTypes, parsed.stopIntents),
  });
}
