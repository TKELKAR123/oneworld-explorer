import { resolveAirport } from "@oneworld-explorer/core";
import { listDirectDestinations, networkNodeMap } from "@oneworld-explorer/schedules";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from")?.trim().toUpperCase();
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 60), 500);
  const continent = url.searchParams.get("continent")?.trim() || undefined;

  if (!from || from.length !== 3) {
    return NextResponse.json(
      { error: "Query param from (3-letter IATA) is required" },
      { status: 400 },
    );
  }

  const nodeMap = networkNodeMap();
  const result = listDirectDestinations(from, undefined, {
    limit,
    continent,
    nodeContinent: (iata) => nodeMap.get(iata)?.continent ?? resolveAirport(iata)?.continent,
  });

  const destinations = result.destinations.map((d) => {
    const node = nodeMap.get(d.iata);
    const airport = resolveAirport(d.iata);
    return {
      iata: d.iata,
      carriers: d.carriers,
      carrierCount: d.carrierCount,
      lat: node?.lat ?? airport?.latitude ?? null,
      lon: node?.lon ?? airport?.longitude ?? null,
      continent: node?.continent ?? airport?.continent ?? null,
    };
  });

  return NextResponse.json({
    ...result,
    destinations,
  });
}
