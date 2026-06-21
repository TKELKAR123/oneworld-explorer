import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-5-reservations", () => {
  it("fails missing OSI", () => {
    const result = validate(CLASSIC_RTW, { ticket: { pnrHasOsiRtw: false } });
    expect(ruleErrors(result, "R3015-5-reservations").length).toBeGreaterThan(0);
  });
});
