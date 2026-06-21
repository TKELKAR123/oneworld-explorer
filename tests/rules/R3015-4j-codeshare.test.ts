import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4j-codeshare", () => {
  it("passes eligible-on-eligible codeshare", () => {
    const segs = [
      { ...CLASSIC_RTW[0]!, marketingCarrier: "BA", operatingCarrier: "AA" },
      ...CLASSIC_RTW.slice(1),
    ];
    expect(ruleErrors(validate(segs), "R3015-4j-codeshare")).toHaveLength(0);
  });

  it("fails ineligible codeshare", () => {
    const segs = [
      { ...CLASSIC_RTW[0]!, marketingCarrier: "BA", operatingCarrier: "UA" },
      ...CLASSIC_RTW.slice(1),
    ];
    expect(ruleErrors(validate(segs), "R3015-4j-codeshare").length).toBeGreaterThan(0);
  });

  it("fails JQ without QF marketing", () => {
    const segs = [
      { ...CLASSIC_RTW[0]!, marketingCarrier: "BA", operatingCarrier: "JQ" },
      ...CLASSIC_RTW.slice(1),
    ];
    expect(ruleErrors(validate(segs), "R3015-4j-codeshare").length).toBeGreaterThan(0);
  });
});
