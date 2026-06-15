import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4a", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4a")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'LHR' }, { from: 'LHR', to: 'DXB' }, { from: 'DXB', to: 'JFK' }]);
    expect(ruleErrors(result, 'R3015-4a').length > 0).toBe(true);
  });
});
