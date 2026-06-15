import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4e-1-na", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4e-1-na")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'LHR' }, { from: 'LHR', to: 'JFK' }, { from: 'JFK', to: 'GRU' }, { from: 'GRU', to: 'EZE' }, { from: 'EZE', to: 'JFK' }, { from: 'JFK', to: 'NRT' }, { from: 'NRT', to: 'SYD' }, { from: 'SYD', to: 'LAX' }, { from: 'LAX', to: 'JFK' }]);
    expect(ruleErrors(result, 'R3015-4e-1-na').length > 0 || ruleErrors(result, 'R3015-4e-intercon').length > 0).toBe(true);
  });
});
