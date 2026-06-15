import type { NormalizedFlight } from "./provider.js";

const ELIGIBLE_CARRIERS = new Set([
  "AA", "AS", "AT", "AY", "BA", "CX", "FJ", "IB", "JL", "MH", "NU", "QF", "QR", "RJ", "UL", "WY",
]);

/** Apply §4(j) + affiliate registry before returning flights to UI. */
export function filterEligibleFlights(flights: NormalizedFlight[]): {
  eligible: NormalizedFlight[];
  rejected: Array<{ flight: NormalizedFlight; reason: string }>;
} {
  const eligible: NormalizedFlight[] = [];
  const rejected: Array<{ flight: NormalizedFlight; reason: string }> = [];

  for (const flight of flights) {
    if (!ELIGIBLE_CARRIERS.has(flight.marketingCarrier)) {
      rejected.push({ flight, reason: "ineligible marketing carrier" });
      continue;
    }
    eligible.push(flight);
  }

  return { eligible, rejected };
}
