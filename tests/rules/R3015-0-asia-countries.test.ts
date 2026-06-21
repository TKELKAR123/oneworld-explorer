import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-0-asia-countries", () => {
  it("passes valid Asia mapping", () => {
    expect(ruleErrors(validate(CLASSIC_RTW), "R3015-0-asia-countries")).toHaveLength(0);
  });
});
