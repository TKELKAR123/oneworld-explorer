import type { AddStopImpact, Continent } from "@oneworld-explorer/core";

/** Opacity for explore fan arcs by eligible carrier count on the edge. */
export function fanArcOpacity(carrierCount: number): number {
  if (carrierCount >= 4) return 0.7;
  if (carrierCount === 3) return 0.55;
  if (carrierCount === 2) return 0.4;
  return 0.25;
}

export function fanArcStrokeWidth(carrierCount: number, hovered: boolean): number {
  return hovered ? 2.5 : carrierCount >= 3 ? 2 : 1.5;
}

export interface NetworkNodeClient {
  iata: string;
  lat: number;
  lon: number;
  continent: Continent | string | null;
  degree: number;
}

export interface DestinationClient {
  iata: string;
  carriers: string[];
  carrierCount: number;
  lat: number | null;
  lon: number | null;
  continent: Continent | string | null;
  impact?: AddStopImpact;
}

export interface DestinationsResponse {
  from: string;
  destinations: DestinationClient[];
  total: number;
  truncated: boolean;
  disclaimer: string;
  source: string;
}
