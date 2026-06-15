import { describe, expect, it } from "vitest";
import { ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4g-swp-transoceanic", () => {
  it("passes valid itinerary", () => {
    const result = validate([
      { from: "SYD", to: "HNL", surface: true },
      { from: "HNL", to: "LAX" },
      { from: "LAX", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SYD" },
    ]);
    expect(ruleErrors(result, "R3015-4g-swp-transoceanic")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([
      { from: "SYD", to: "HNL", surface: true },
      { from: "HNL", to: "LHR", surface: true },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SYD" },
    ]);
    expect(ruleErrors(result, "R3015-4g-swp-transoceanic").length > 0).toBe(true);
  });
});
