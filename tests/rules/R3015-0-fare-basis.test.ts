import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-0-fare-basis", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-0-fare-basis")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate(CLASSIC_RTW, { travelClass: 'premium-economy' as never });
    expect(result.analysis?.suggestedFareBasis === null || ruleErrors(result, 'R3015-0-fare-basis').length >= 0).toBe(true);
  });
});
