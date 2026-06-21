import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-0-tc-def", () => {
  it("passes valid TC mapping", () => {
    expect(ruleErrors(validate(CLASSIC_RTW), "R3015-0-tc-def")).toHaveLength(0);
  });
});
