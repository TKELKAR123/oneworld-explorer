import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-5b-booking", () => {
  it("passes permitted RBD", () => {
    const segs = [{ ...CLASSIC_RTW[0]!, marketingCarrier: "BA", rbd: "L" }, ...CLASSIC_RTW.slice(1)];
    expect(ruleErrors(validate(segs), "R3015-5b-booking")).toHaveLength(0);
  });

  it("fails invalid RBD", () => {
    const segs = [{ ...CLASSIC_RTW[0]!, marketingCarrier: "BA", rbd: "X" }, ...CLASSIC_RTW.slice(1)];
    expect(ruleErrors(validate(segs), "R3015-5b-booking").length).toBeGreaterThan(0);
  });
});
