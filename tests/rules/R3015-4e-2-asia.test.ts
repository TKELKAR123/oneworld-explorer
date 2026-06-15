import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4e-2-asia", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4e-2-asia")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "NRT" },
      { from: "NRT", to: "LAX" },
      { from: "LAX", to: "HKG" },
      { from: "HKG", to: "LHR" },
      { from: "LHR", to: "DEL" },
      { from: "DEL", to: "SYD" },
      { from: "SYD", to: "JFK" },
    ]);
    expect(ruleErrors(result, "R3015-4e-2-asia").length > 0).toBe(true);
  });
});
