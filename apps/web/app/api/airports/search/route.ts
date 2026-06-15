import { searchAirports } from "@oneworld-explorer/core";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? 8), 20);

  if (q.length < 1) {
    return NextResponse.json({ airports: [] });
  }

  const airports = searchAirports(q, limit).map((a) => ({
    iata: a.iata,
    name: a.name,
    city: a.city,
    country: a.country,
    continent: a.continent,
  }));

  return NextResponse.json({ airports });
}
