import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4b-hawaii", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4b-hawaii")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([{ from: 'HNL', to: 'LAX' }, { from: 'LAX', to: 'HNL' }, { from: 'HNL', to: 'NRT' }, { from: 'NRT', to: 'SYD' }, { from: 'SYD', to: 'JFK' }]);
    expect(ruleErrors(result, 'R3015-4b-hawaii').length > 0).toBe(true);
  });
});
