import { describe, expect, it } from "vitest";
import { INVALID_OPEN_JAW_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4c-open-jaw-g", () => {
  it("passes valid itinerary", () => {
    const result = validate([
      { from: "MLE", to: "CMB", surface: true },
      { from: "CMB", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "MLE" },
    ]);
    expect(ruleErrors(result, "R3015-4c-open-jaw-g")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate(INVALID_OPEN_JAW_RTW);
    expect(ruleErrors(result, "R3015-4c-origin").length).toBeGreaterThan(0);
  });
});
