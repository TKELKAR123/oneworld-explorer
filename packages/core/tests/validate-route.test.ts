import { describe, expect, it } from "vitest";
import { parseRoute, validateRoute } from "../src/index.js";

describe("parseRoute", () => {
  it("parses airport code chains", () => {
    const { itinerary, issues } = parseRoute(["JFK", "LHR", "DXB", "SIN", "SYD", "LAX", "JFK"]);
    expect(issues).toHaveLength(0);
    expect(itinerary?.points.map((p) => p.iata)).toEqual([
      "JFK",
      "LHR",
      "DXB",
      "SIN",
      "SYD",
      "LAX",
      "JFK",
    ]);
    expect(itinerary?.segments).toHaveLength(6);
  });

  it("reports unknown airports", () => {
    const { itinerary, issues } = parseRoute(["XXX", "JFK"]);
    expect(itinerary).toBeNull();
    expect(issues[0]?.code).toBe("UNKNOWN_AIRPORT");
  });
});

describe("validateRoute — classic RTW", () => {
  const classic = [
    { from: "JFK", to: "LHR" },
    { from: "LHR", to: "DXB" },
    { from: "DXB", to: "SIN" },
    { from: "SIN", to: "SYD" },
    { from: "SYD", to: "LAX" },
    { from: "LAX", to: "JFK" },
  ];

  it("accepts a valid 4-continent eastbound RTW", () => {
    const result = validateRoute(classic, { travelClass: "economy" });
    const errors = result.issues.filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.analysis?.continentCount).toBe(4);
    expect(result.analysis?.suggestedFareBasis).toBe("LONE4");
    expect(result.analysis?.crossesAtlantic).toBe(true);
    expect(result.analysis?.crossesPacific).toBe(true);
  });
});

describe("R3015-4a oceans", () => {
  it("rejects missing Pacific crossing", () => {
    const result = validateRoute(
      [
        { from: "JFK", to: "LHR" },
        { from: "LHR", to: "DXB" },
        { from: "DXB", to: "JFK" },
      ],
      { travelClass: "economy", validationPhase: "ticketReady" },
    );
    expect(result.issues.some((i) => i.code === "R3015-4a" && i.message.includes("Pacific"))).toBe(
      true,
    );
  });
});

describe("R3015-4h segment count", () => {
  it("rejects fewer than 3 segments", () => {
    const result = validateRoute(
      [
        { from: "JFK", to: "LHR" },
        { from: "LHR", to: "JFK" },
      ],
      { travelClass: "economy", validationPhase: "ticketReady" },
    );
    expect(result.issues.some((i) => i.code === "R3015-4h-segment-count")).toBe(true);
  });
});

describe("R3015-4c open jaw", () => {
  it("permits US open jaw with surface sector", () => {
    const result = validateRoute(
      [
        { from: "JFK", to: "BOS", surface: true },
        { from: "BOS", to: "LHR" },
        { from: "LHR", to: "DXB" },
        { from: "DXB", to: "SIN" },
        { from: "SIN", to: "SYD" },
        { from: "SYD", to: "LAX" },
        { from: "LAX", to: "BOS" },
      ],
      { travelClass: "economy" },
    );
    expect(result.issues.some((i) => i.code === "R3015-4c-origin")).toBe(false);
  });
});

describe("R3015-0 three-continent origin", () => {
  it("rejects 3-continent fare from South America", () => {
    const result = validateRoute(
      [
        { from: "GRU", to: "JFK" },
        { from: "JFK", to: "LHR" },
        { from: "LHR", to: "GRU" },
      ],
      { travelClass: "economy" },
    );
    expect(result.issues.some((i) => i.code === "R3015-0-three-continent-origin")).toBe(true);
  });
});

describe("R3015-4i duplicate sector", () => {
  it("rejects duplicate city pair in same direction", () => {
    const result = validateRoute(
      [
        { from: "JFK", to: "LHR" },
        { from: "LHR", to: "DXB" },
        { from: "DXB", to: "SIN" },
        { from: "SIN", to: "SYD" },
        { from: "SYD", to: "LAX" },
        { from: "LAX", to: "JFK" },
        { from: "JFK", to: "LHR" },
      ],
      { travelClass: "economy" },
    );
    expect(result.issues.some((i) => i.code === "R3015-4i-duplicate-sector")).toBe(true);
  });
});

describe("R3015-4b-hawaii", () => {
  it("rejects Hawaii backtrack", () => {
    const result = validateRoute(
      [
        { from: "HNL", to: "LAX" },
        { from: "LAX", to: "HNL" },
        { from: "HNL", to: "NRT" },
        { from: "NRT", to: "SYD" },
        { from: "SYD", to: "JFK" },
      ],
      { travelClass: "economy" },
    );
    expect(result.issues.some((i) => i.code === "R3015-4b-hawaii")).toBe(true);
  });
});
