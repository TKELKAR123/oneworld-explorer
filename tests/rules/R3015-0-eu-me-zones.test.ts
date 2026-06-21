import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-0-eu-me-zones", () => {
  it("passes valid EU/ME sub-zones", () => {
    expect(ruleErrors(validate(CLASSIC_RTW), "R3015-0-eu-me-zones")).toHaveLength(0);
  });
});
