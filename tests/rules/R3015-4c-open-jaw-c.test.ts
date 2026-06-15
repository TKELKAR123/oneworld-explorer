import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4c-open-jaw-c", () => {
  it("passes valid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'YYZ', surface: true }, { from: 'YYZ', to: 'LHR' }, { from: 'LHR', to: 'DXB' }, { from: 'DXB', to: 'SIN' }, { from: 'SIN', to: 'SYD' }, { from: 'SYD', to: 'LAX' }, { from: 'LAX', to: 'YYZ' }]);
    expect(ruleErrors(result, "R3015-4c-open-jaw-c")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'LHR' }, { from: 'LHR', to: 'YYZ' }]);
    expect(ruleErrors(result, 'R3015-4c-origin').length > 0).toBe(true);
  });
});
