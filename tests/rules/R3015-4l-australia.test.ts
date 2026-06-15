import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4l-australia", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4l-australia")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([{ from: 'JFK', to: 'LHR' }, { from: 'LHR', to: 'DXB' }, { from: 'DXB', to: 'PER' }, { from: 'PER', to: 'SYD' }, { from: 'SYD', to: 'PER' }, { from: 'PER', to: 'LAX' }, { from: 'LAX', to: 'JFK' }]);
    expect(ruleErrors(result, 'R3015-4l-australia').length > 0).toBe(true);
  });
});
