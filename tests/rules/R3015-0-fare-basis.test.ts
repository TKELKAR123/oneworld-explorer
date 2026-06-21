import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-0-fare-basis", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-0-fare-basis")).toHaveLength(0);
  });

  it("premium economy uses LONE basis not business", () => {
    const result = validate(CLASSIC_RTW, { travelClass: "premium-economy" });
    expect(result.analysis?.suggestedFareBasis).toBe("LONE4 (+ PE surcharge per segment)");
    expect(ruleErrors(result, "R3015-0-fare-basis")).toHaveLength(0);
  });
});
