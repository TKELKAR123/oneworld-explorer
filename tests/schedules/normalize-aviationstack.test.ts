import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { normalizeAviationstackResponse } from "../../packages/schedules/src/normalize.js";

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURE_DIR, name), "utf-8"));
}

describe("normalizeAviationstackResponse", () => {
  it("maps LHR→JFK fixture to NormalizedFlight", () => {
    const raw = loadFixture("aviationstack-lhr-jfk.json");
    const flights = normalizeAviationstackResponse(raw);

    expect(flights.length).toBeGreaterThan(0);
    const ba178 = flights.find((f) => f.flightNumber === "BA178");
    expect(ba178).toBeDefined();
    expect(ba178?.marketingCarrier).toBe("BA");
    expect(ba178?.operatingCarrier).toBe("BA");
    expect(ba178?.departure.point).toBe("LHR");
    expect(ba178?.arrival.point).toBe("JFK");
    expect(ba178?.provider).toBe("aviationstack");
    expect(ba178?.departure.time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(ba178?.arrival.time).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("uses codeshare airline as operating carrier when present", () => {
    const flights = normalizeAviationstackResponse({
      data: [
        {
          departure: { iata: "SYD", scheduled: "2026-09-15T10:00:00Z" },
          arrival: { iata: "LAX", scheduled: "2026-09-15T18:00:00Z" },
          airline: { iata: "QF" },
          flight: {
            iata: "QF7",
            codeshared: { airline_iata: "JQ" },
          },
        },
      ],
    });

    expect(flights).toHaveLength(1);
    expect(flights[0]?.marketingCarrier).toBe("QF");
    expect(flights[0]?.operatingCarrier).toBe("JQ");
    expect(flights[0]?.operatingCarrierSource).toBe("api");
  });

  it("returns empty array for invalid payload", () => {
    expect(normalizeAviationstackResponse(null)).toEqual([]);
    expect(normalizeAviationstackResponse({ data: [] })).toEqual([]);
  });
});
