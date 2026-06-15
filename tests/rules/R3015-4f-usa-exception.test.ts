import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4f-usa-exception", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4f-usa-exception")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'LHR' }, { from: 'LHR', to: 'GRU' }, { from: 'GRU', to: 'JFK' }, { from: 'JFK', to: 'NRT' }, { from: 'NRT', to: 'SYD' }, { from: 'SYD', to: 'LAX' }, { from: 'LAX', to: 'JFK' }]);
    expect(result.issues.some(i => i.code === 'R3015-4f-usa-exception' || i.code === 'R3015-4f-origin-intl')).toBe(true);
  });
});
