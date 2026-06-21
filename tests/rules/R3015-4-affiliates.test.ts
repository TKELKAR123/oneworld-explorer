import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4-affiliates", () => {
  it("passes AA/MQ affiliate", () => {
    const segs = [
      { ...CLASSIC_RTW[0]!, marketingCarrier: "AA", operatingCarrier: "MQ" },
      ...CLASSIC_RTW.slice(1),
    ];
    expect(ruleErrors(validate(segs), "R3015-4-affiliates")).toHaveLength(0);
  });
});
