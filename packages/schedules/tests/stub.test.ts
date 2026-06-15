import { describe, expect, it } from "vitest";
import {
  filterEligibleFlights,
  inferOperatingCarrier,
  searchSchedules,
} from "../src/index.js";

describe("searchSchedules stub", () => {
  it("returns empty flights with scheduleOnly flag", async () => {
    const result = await searchSchedules({
      from: "LHR",
      to: "JFK",
      date: "2026-09-15",
    });
    expect(result.stub).toBe(true);
    expect(result.scheduleOnly).toBe(true);
    expect(result.flights).toEqual([]);
    expect(result.asOf).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("filterEligibleFlights", () => {
  const flight = (mkt: string) => ({
    marketingCarrier: mkt,
    operatingCarrier: mkt,
    operatingCarrierSource: "unknown" as const,
    flightNumber: `${mkt}100`,
    departure: { point: "LHR", time: "2026-09-15T10:00:00Z" },
    arrival: { point: "JFK", time: "2026-09-15T18:00:00Z" },
    stops: [],
    provider: "test",
    fetchedAt: new Date().toISOString(),
  });

  it("accepts eligible oneworld marketing carriers", () => {
    const { eligible, rejected } = filterEligibleFlights([flight("BA"), flight("QF")]);
    expect(eligible).toHaveLength(2);
    expect(rejected).toHaveLength(0);
  });

  it("rejects ineligible marketing carriers", () => {
    const { eligible, rejected } = filterEligibleFlights([flight("UA")]);
    expect(eligible).toHaveLength(0);
    expect(rejected[0]?.reason).toContain("ineligible");
  });
});

describe("inferOperatingCarrier", () => {
  it("defaults to marketing when unknown", () => {
    const r = inferOperatingCarrier("QF", "QF7");
    expect(r.operatingCarrier).toBe("QF");
    expect(r.source).toBe("unknown");
  });
});
