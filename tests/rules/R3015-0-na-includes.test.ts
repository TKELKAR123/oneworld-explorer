import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-0-na-includes", () => {
  it("passes valid North America mapping", () => {
    expect(ruleErrors(validate(CLASSIC_RTW), "R3015-0-na-includes")).toHaveLength(0);
  });
});
