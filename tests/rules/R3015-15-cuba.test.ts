import { describe, expect, it } from "vitest";
import { ruleErrors, validate } from "../helpers/route.js";

describe("R3015-15-cuba", () => {
  it("fails AA-operated Cuba segment", () => {
    const segs = [
      { from: "MIA", to: "HAV", marketingCarrier: "AA", operatingCarrier: "AA" },
      { from: "HAV", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "MIA" },
    ];
    expect(ruleErrors(validate(segs), "R3015-15-cuba").length).toBeGreaterThan(0);
  });
});
