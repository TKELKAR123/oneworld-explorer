import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, INVALID_OPEN_JAW_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4c-origin", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-4c-origin")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const result = validate(INVALID_OPEN_JAW_RTW);
    expect(ruleErrors(result, "R3015-4c-origin").length).toBeGreaterThan(0);
  });
});
