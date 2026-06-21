import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-0-continent-def", () => {
  it("passes valid continents", () => {
    expect(ruleErrors(validate(CLASSIC_RTW), "R3015-0-continent-def")).toHaveLength(0);
  });
});
