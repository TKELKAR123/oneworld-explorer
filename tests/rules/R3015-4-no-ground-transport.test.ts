import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-4-no-ground-transport", () => {
  it("fails ground transport segment", () => {
    const segs = [{ ...CLASSIC_RTW[0]!, groundTransport: true }, ...CLASSIC_RTW.slice(1)];
    expect(ruleErrors(validate(segs), "R3015-4-no-ground-transport").length).toBeGreaterThan(0);
  });
});
