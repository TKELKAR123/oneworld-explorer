"use client";

import { useEffect, useState } from "react";
import type { AddStopImpact, RouteAnalysis, TravelClass } from "@oneworld-explorer/core";
import type { DestinationClient } from "./explore-fan-style";

export function useDestinationImpacts(
  rawDestinations: DestinationClient[],
  input: {
    stops: string[];
    legTypes: ("flight" | "surface")[];
    anchorIata: string | null;
    travelClass: TravelClass;
    currentAnalysis?: RouteAnalysis | null;
  },
): DestinationClient[] {
  const [enriched, setEnriched] = useState<DestinationClient[]>(rawDestinations);

  useEffect(() => {
    if (!input.anchorIata || rawDestinations.length === 0) {
      setEnriched(rawDestinations);
      return;
    }

    const controller = new AbortController();
    const candidates = rawDestinations.map((d) => ({
      iata: d.iata,
      carrierCount: d.carrierCount,
    }));

    void fetch("/api/itinerary/preview-add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        stops: input.stops,
        legTypes: input.legTypes,
        anchorIata: input.anchorIata,
        travelClass: input.travelClass,
        currentAnalysis: input.currentAnalysis ?? null,
        candidates,
      }),
    })
      .then((r) => r.json())
      .then((body: { impacts: Record<string, AddStopImpact> }) => {
        setEnriched(
          rawDestinations.map((d) => ({
            ...d,
            impact: body.impacts[d.iata],
          })),
        );
      })
      .catch(() => {
        setEnriched(rawDestinations);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- batch key avoids array identity loops
  }, [
    input.anchorIata,
    input.travelClass,
    input.stops.join("|"),
    input.legTypes.join("|"),
    JSON.stringify(input.currentAnalysis?.continentCount ?? null),
    JSON.stringify(input.currentAnalysis?.suggestedFareBasis ?? null),
    rawDestinations.map((d) => `${d.iata}:${d.carrierCount}`).join(","),
  ]);

  return enriched;
}
