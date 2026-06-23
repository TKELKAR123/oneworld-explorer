import { describe, expect, it } from "vitest";
import { analyzeRoute, parseRoute } from "@oneworld-explorer/core";
import { CLASSIC_RTW } from "../helpers/route";

/** Build analysis matching SC-001 for segment ledger tests. */
function sc001Analysis() {
  const { itinerary } = parseRoute(CLASSIC_RTW);
  if (!itinerary) throw new Error("fixture");
  return analyzeRoute(itinerary, { travelClass: "economy" });
}

describe("SegmentLedgerCompact expectations", () => {
  it("SC-001 has Asia and SWP at 0/4", () => {
    const analysis = sc001Analysis();
    expect(analysis.flightSegmentsByContinent.asia).toBe(0);
    expect(analysis.flightSegmentsByContinent["south-west-pacific"]).toBe(0);
    expect(analysis.flightSegmentsByContinent["europe-middle-east"]).toBe(1);
    expect(analysis.flightSegmentsByContinent["north-america"]).toBe(1);
  });
});
