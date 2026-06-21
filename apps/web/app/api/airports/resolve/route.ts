import { getCountryDisplayName, resolveAirport } from "@oneworld-explorer/core";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const iata = searchParams.get("iata")?.trim().toUpperCase() ?? "";

  if (iata.length !== 3) {
    return NextResponse.json(
      { error: "iata must be a 3-letter code" },
      { status: 400 },
    );
  }

  const airport = resolveAirport(iata);
  if (!airport) {
    return NextResponse.json({ airport: null });
  }

  return NextResponse.json({
    airport: {
      iata: airport.iata,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      countryName: getCountryDisplayName(airport.country),
      continent: airport.continent,
      latitude: airport.latitude,
      longitude: airport.longitude,
    },
  });
}
