import { describe, expect, it } from "vitest";
import { INVALID_OPEN_JAW_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4c-open-jaw-b", () => {
  it("passes valid itinerary", () => {
    const result = validate([
      { from: "DXB", to: "AUH", surface: true },
      { from: "AUH", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "DXB" },
    ]);
    expect(ruleErrors(result, "R3015-4c-open-jaw-b")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate(INVALID_OPEN_JAW_RTW);
    expect(ruleErrors(result, "R3015-4c-origin").length).toBeGreaterThan(0);
  });
});
