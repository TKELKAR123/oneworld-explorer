import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-0-fare-class", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW, { travelClass: 'economy' });
    expect(ruleErrors(result, "R3015-0-fare-class")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([...CLASSIC_RTW.slice(0, 5), { from: 'LAX', to: 'JFK', bookingClass: 'business' }], { travelClass: 'economy' });
    expect(ruleErrors(result, 'R3015-0-fare-class').length > 0).toBe(true);
  });
});
