import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4-carriers", () => {
  it("passes eligible carrier", () => {
    const segs = CLASSIC_RTW.map((s, i) =>
      i === 0 ? { ...s, marketingCarrier: "BA", operatingCarrier: "BA" } : s,
    );
    expect(ruleErrors(validate(segs), "R3015-4-carriers")).toHaveLength(0);
  });

  it("fails ineligible carrier", () => {
    const segs = [
      { ...CLASSIC_RTW[0]!, marketingCarrier: "UA", operatingCarrier: "UA" },
      ...CLASSIC_RTW.slice(1),
    ];
    expect(ruleErrors(validate(segs), "R3015-4-carriers").length).toBeGreaterThan(0);
  });
});
