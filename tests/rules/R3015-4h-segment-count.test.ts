import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate, validateTicketReady } from "../helpers/route.js";

describe("R3015-4h-segment-count", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4h-segment-count")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validateTicketReady([{ from: 'JFK', to: 'LHR' }, { from: 'LHR', to: 'JFK' }]);
    expect(ruleErrors(result, 'R3015-4h-segment-count').length > 0).toBe(true);
  });
});
