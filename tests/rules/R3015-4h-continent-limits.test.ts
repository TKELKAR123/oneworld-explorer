import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4h-continent-limits", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4h-continent-limits")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "CDG" },
      { from: "CDG", to: "FRA" },
      { from: "FRA", to: "MAD" },
      { from: "MAD", to: "FCO" },
      { from: "FCO", to: "HEL" },
      { from: "HEL", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
    ]);
    expect(ruleErrors(result, "R3015-4h-continent-limits").length > 0).toBe(true);
  });
});
