import type { NormalizedFlight } from "./provider.js";

/** Map provider-specific JSON to canonical FlightInstance shape. */
export function normalizeAviationstackResponse(_raw: unknown): NormalizedFlight[] {
  return [];
}

export function normalizeAeroDataBoxResponse(_raw: unknown): NormalizedFlight[] {
  return [];
}

export function inferOperatingCarrier(
  marketingCarrier: string,
  _flightNumber: string,
): { operatingCarrier: string; source: "inferred" | "unknown" } {
  return { operatingCarrier: marketingCarrier, source: "unknown" };
}
