import { previewAddStop, type RouteAnalysis, type TravelClass } from "@oneworld-explorer/core";
import { NextResponse } from "next/server";

interface PreviewBody {
  stops: string[];
  legTypes: ("flight" | "surface")[];
  anchorIata: string;
  travelClass: TravelClass;
  currentAnalysis?: RouteAnalysis | null;
  candidates: Array<{ iata: string; carrierCount: number }>;
}

export async function POST(request: Request) {
  let body: PreviewBody;
  try {
    body = (await request.json()) as PreviewBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.anchorIata || !Array.isArray(body.candidates)) {
    return NextResponse.json({ error: "anchorIata and candidates required" }, { status: 400 });
  }

  const impacts: Record<string, ReturnType<typeof previewAddStop>> = {};
  for (const c of body.candidates) {
    impacts[c.iata] = previewAddStop({
      stops: body.stops ?? [],
      legTypes: body.legTypes ?? [],
      anchorIata: body.anchorIata,
      candidateIata: c.iata,
      travelClass: body.travelClass ?? "economy",
      currentAnalysis: body.currentAnalysis ?? null,
      networkDirect: c.carrierCount > 0,
      networkCarrierCount: c.carrierCount,
    });
  }

  return NextResponse.json({ impacts });
}
