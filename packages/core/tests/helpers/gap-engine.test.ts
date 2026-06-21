import { describe, expect, it } from "vitest";
import {
  connectionGapAtPoint,
  hasScheduleCompleteItinerary,
  isTransferAtPoint,
  isTransferGap,
  qualifiesUsaDoubleDepartureException,
} from "../../src/rules/helpers/gap-engine.js";
import { parseRoute } from "../../src/parse-route.js";

describe("gap-engine", () => {
  it("isTransferGap is <=24h and >0", () => {
    expect(isTransferGap(12)).toBe(true);
    expect(isTransferGap(24)).toBe(true);
    expect(isTransferGap(25)).toBe(false);
  });

  it("detects transfer at connection point", () => {
    const { itinerary } = parseRoute([
      {
        from: "JFK",
        to: "LHR",
        departureTime: "2026-06-01T10:00:00Z",
        arrivalTime: "2026-06-01T22:00:00Z",
      },
      {
        from: "LHR",
        to: "DXB",
        departureTime: "2026-06-02T08:00:00Z",
        arrivalTime: "2026-06-02T18:00:00Z",
      },
    ]);
    expect(itinerary).toBeTruthy();
    expect(hasScheduleCompleteItinerary(itinerary!)).toBe(true);
    expect(connectionGapAtPoint(itinerary!, 1)).toBe(10);
    expect(isTransferAtPoint(itinerary!, 1)).toBe(true);
  });

  it("qualifies US double departure when transfer exists", () => {
    const { itinerary } = parseRoute([
      {
        from: "JFK",
        to: "LHR",
        departureTime: "2026-06-01T10:00:00Z",
        arrivalTime: "2026-06-01T22:00:00Z",
      },
      {
        from: "LHR",
        to: "JFK",
        departureTime: "2026-06-10T10:00:00Z",
        arrivalTime: "2026-06-10T20:00:00Z",
      },
      {
        from: "JFK",
        to: "CDG",
        departureTime: "2026-06-10T23:00:00Z",
        arrivalTime: "2026-06-11T10:00:00Z",
      },
      {
        from: "CDG",
        to: "JFK",
        departureTime: "2026-06-20T10:00:00Z",
        arrivalTime: "2026-06-20T18:00:00Z",
      },
    ]);
    expect(itinerary).toBeTruthy();
    expect(qualifiesUsaDoubleDepartureException(itinerary!)).toBe(true);
  });
});
