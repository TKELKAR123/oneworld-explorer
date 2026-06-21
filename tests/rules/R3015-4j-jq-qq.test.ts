import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4j-jq-qq", () => {
  it("passes QF/JQ exception", () => {
    const segs = [
      { ...CLASSIC_RTW[0]!, marketingCarrier: "QF", operatingCarrier: "JQ" },
      ...CLASSIC_RTW.slice(1),
    ];
    expect(ruleErrors(validate(segs), "R3015-4j-jq-qq")).toHaveLength(0);
  });

  it("passes QF/QQ exception", () => {
    const segs = [
      { ...CLASSIC_RTW[0]!, marketingCarrier: "QF", operatingCarrier: "QQ" },
      ...CLASSIC_RTW.slice(1),
    ];
    expect(ruleErrors(validate(segs), "R3015-4j-jq-qq")).toHaveLength(0);
  });
});
