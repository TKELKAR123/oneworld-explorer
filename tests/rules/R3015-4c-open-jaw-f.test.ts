import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4c-open-jaw-f", () => {
  it("passes valid itinerary", () => {
    const result = validate([{ from: 'JNB', to: 'CPT', surface: true }, { from: 'CPT', to: 'LHR' }, { from: 'LHR', to: 'JFK' }, { from: 'JFK', to: 'NRT' }, { from: 'NRT', to: 'SYD' }, { from: 'SYD', to: 'JNB' }]);
    expect(ruleErrors(result, "R3015-4c-open-jaw-f")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate([{ from: 'JNB', to: 'LHR' }, { from: 'LHR', to: 'CPT' }]);
    expect(ruleErrors(result, 'R3015-4c-origin').length > 0).toBe(true);
  });
});
