import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-15-stock-jq", () => {
  it("fails IB stock with QF/JQ", () => {
    const segs = [
      { ...CLASSIC_RTW[0]!, marketingCarrier: "QF", operatingCarrier: "JQ" },
      ...CLASSIC_RTW.slice(1),
    ];
    const result = validate(segs, { ticket: { validatingCarrier: "IB" } });
    expect(ruleErrors(result, "R3015-15-stock-jq").length).toBeGreaterThan(0);
  });
});
