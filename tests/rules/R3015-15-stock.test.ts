import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-15-stock", () => {
  it("passes BA stock", () => {
    const result = validate(CLASSIC_RTW, { ticket: { validatingCarrier: "BA" } });
    expect(ruleErrors(result, "R3015-15-stock")).toHaveLength(0);
  });

  it("fails NU stock", () => {
    const result = validate(CLASSIC_RTW, { ticket: { validatingCarrier: "NU" } });
    expect(ruleErrors(result, "R3015-15-stock").length).toBeGreaterThan(0);
  });
});
