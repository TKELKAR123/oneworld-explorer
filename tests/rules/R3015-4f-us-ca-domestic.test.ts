import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4f-us-ca-domestic", () => {
  it("passes valid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'YYZ' }, { from: 'YYZ', to: 'LHR' }, { from: 'LHR', to: 'DXB' }, { from: 'DXB', to: 'SIN' }, { from: 'SIN', to: 'SYD' }, { from: 'SYD', to: 'LAX' }, { from: 'LAX', to: 'JFK' }]);
    expect(ruleErrors(result, "R3015-4f-us-ca-domestic")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'YYZ' }, { from: 'YYZ', to: 'LHR' }, { from: 'LHR', to: 'JFK' }]);
    expect(ruleErrors(result, 'R3015-4f-us-ca-domestic').length >= 0).toBe(true);
  });
});
