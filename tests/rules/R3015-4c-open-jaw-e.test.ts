import { describe, expect, it } from "vitest";
import { INVALID_OPEN_JAW_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4c-open-jaw-e", () => {
  it("passes valid itinerary", () => {
    const result = validate([{ from: 'KUL', to: 'SIN', surface: true }, { from: 'SIN', to: 'LHR' }, { from: 'LHR', to: 'JFK' }, { from: 'JFK', to: 'NRT' }, { from: 'NRT', to: 'SYD' }, { from: 'SYD', to: 'KUL' }]);
    expect(ruleErrors(result, "R3015-4c-open-jaw-e")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate(INVALID_OPEN_JAW_RTW);
    expect(ruleErrors(result, "R3015-4c-origin").length).toBeGreaterThan(0);
  });
});
