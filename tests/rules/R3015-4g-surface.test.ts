import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4g-surface", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4g-surface")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'LHR', surface: true }, { from: 'LHR', to: 'DXB' }, { from: 'DXB', to: 'SIN' }, { from: 'SIN', to: 'SYD' }, { from: 'SYD', to: 'LAX' }, { from: 'LAX', to: 'JFK' }]);
    expect(ruleErrors(result, 'R3015-4g-surface').length > 0).toBe(true);
  });
});
