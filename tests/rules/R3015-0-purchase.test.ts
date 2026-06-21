import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-0-purchase", () => {
  it("passes when purchased before departure", () => {
    const result = validate(CLASSIC_RTW, { ticket: { purchasedBeforeDeparture: true } });
    expect(ruleErrors(result, "R3015-0-purchase")).toHaveLength(0);
  });

  it("fails when not purchased before departure", () => {
    const result = validate(CLASSIC_RTW, { ticket: { purchasedBeforeDeparture: false } });
    expect(ruleErrors(result, "R3015-0-purchase").length).toBeGreaterThan(0);
  });
});
