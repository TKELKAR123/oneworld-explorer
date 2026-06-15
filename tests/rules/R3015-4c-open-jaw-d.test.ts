import { describe, expect, it } from "vitest";
import { ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4c-open-jaw-d", () => {
  it("passes valid itinerary", () => {
    const result = validate([
      { from: "HKG", to: "PEK", surface: true },
      { from: "PEK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "PEK" },
    ]);
    expect(ruleErrors(result, "R3015-4c-open-jaw-d")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([
      { from: "HKG", to: "LHR" },
      { from: "LHR", to: "PEK" },
    ]);
    expect(ruleErrors(result, "R3015-4c-origin").length > 0).toBe(true);
  });
});
