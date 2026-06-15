import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4i-duplicate-sector", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4i-duplicate-sector")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([...CLASSIC_RTW, { from: 'JFK', to: 'LHR' }]);
    expect(ruleErrors(result, 'R3015-4i-duplicate-sector').length > 0).toBe(true);
  });
});
