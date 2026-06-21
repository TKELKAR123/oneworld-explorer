import { buildReturnGuide, resolveAirport } from "@oneworld-explorer/core";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin")?.trim().toUpperCase() ?? "";

  if (origin.length !== 3) {
    return NextResponse.json({ error: "origin must be a 3-letter IATA code" }, { status: 400 });
  }

  if (!resolveAirport(origin)) {
    return NextResponse.json({ error: "unknown origin airport" }, { status: 404 });
  }

  const guide = buildReturnGuide(origin);
  return NextResponse.json({ guide });
}
