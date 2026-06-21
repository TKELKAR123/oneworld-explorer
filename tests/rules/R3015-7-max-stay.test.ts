import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-7-max-stay", () => {
  it("fails over 12 months", () => {
    const segs = CLASSIC_RTW.map((s, i) => ({
      ...s,
      departureTime:
        i === 0 ? "2026-01-01T10:00:00Z" : i === 5 ? "2027-02-01T10:00:00Z" : undefined,
      arrivalTime: i === 4 ? "2027-02-01T10:00:00Z" : undefined,
    }));
    expect(ruleErrors(validate(segs), "R3015-7-max-stay").length).toBeGreaterThan(0);
  });
});
