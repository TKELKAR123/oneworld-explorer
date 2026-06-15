import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4c-open-jaw-a", () => {
  it("passes valid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'BOS', surface: true }, { from: 'BOS', to: 'LHR' }, { from: 'LHR', to: 'DXB' }, { from: 'DXB', to: 'SIN' }, { from: 'SIN', to: 'SYD' }, { from: 'SYD', to: 'LAX' }, { from: 'LAX', to: 'BOS' }]);
    expect(ruleErrors(result, "R3015-4c-open-jaw-a")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'LHR' }, { from: 'LHR', to: 'BOS' }]);
    expect(ruleErrors(result, 'R3015-4c-origin').length > 0 || ruleErrors(result, 'R3015-4c-open-jaw-a').length > 0).toBe(true);
  });
});
