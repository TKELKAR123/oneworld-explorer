import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4f-origin-intl", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4f-origin-intl")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "GRU" },
      { from: "GRU", to: "LHR" },
      { from: "LHR", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "LHR" },
    ]);
    expect(ruleErrors(result, "R3015-4f-origin-intl").length > 0).toBe(true);
  });
});
