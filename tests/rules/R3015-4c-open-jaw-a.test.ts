import { describe, expect, it } from "vitest";
import { INVALID_OPEN_JAW_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4c-open-jaw-a", () => {
  it("passes valid itinerary with explicit surface at start", () => {
    const result = validate([{ from: 'JFK', to: 'BOS', surface: true }, { from: 'BOS', to: 'LHR' }, { from: 'LHR', to: 'DXB' }, { from: 'DXB', to: 'SIN' }, { from: 'SIN', to: 'SYD' }, { from: 'SYD', to: 'LAX' }, { from: 'LAX', to: 'BOS' }]);
    expect(ruleErrors(result, "R3015-4c-open-jaw-a")).toHaveLength(0);
  });

  it("passes implicit US open jaw JFK origin ORD return without surface leg", () => {
    const result = validate([
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "ORD" },
    ]);
    expect(ruleErrors(result, "R3015-4c-open-jaw-a")).toHaveLength(0);
    expect(ruleErrors(result, "R3015-4c-origin")).toHaveLength(0);
    expect(result.analysis?.originReturn.mode).toBe("openJaw");
  });

  it("fails invalid itinerary", () => {
    const result = validate(INVALID_OPEN_JAW_RTW);
    expect(ruleErrors(result, "R3015-4c-origin").length).toBeGreaterThan(0);
  });
});
