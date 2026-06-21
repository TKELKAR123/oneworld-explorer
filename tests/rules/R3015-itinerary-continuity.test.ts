import { describe, expect, it } from "vitest";
import { parseRoute, validateRoute } from "@oneworld-explorer/core";

describe("R3015-itinerary-continuity", () => {
  it("rejects DXB/SIN gap (SC-008 repro)", () => {
    const result = validateRoute([
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
    ]);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "R3015-itinerary-continuity")).toBe(
      true,
    );
  });

  it("accepts chained stop list", () => {
    const { itinerary, issues } = parseRoute([
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
    ]);
    expect(issues).toHaveLength(0);
    expect(itinerary?.points.map((p) => p.iata)).toEqual(["JFK", "LHR", "DXB", "SIN"]);
  });
});
