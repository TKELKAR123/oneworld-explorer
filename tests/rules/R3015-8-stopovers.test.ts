import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-8-stopovers", () => {
  const base = "2026-06-01T10:00:00Z";
  const stop1Arr = "2026-06-02T10:00:00Z";
  const stop1Dep = "2026-06-04T10:00:00Z";
  const stop2Arr = "2026-06-05T10:00:00Z";
  const stop2Dep = "2026-06-08T10:00:00Z";

  it("fails fewer than 2 stopovers", () => {
    const segs = CLASSIC_RTW.map((s, i) => ({
      ...s,
      departureTime: i === 0 ? base : i === 1 ? stop1Dep : undefined,
      arrivalTime: i === 0 ? stop1Arr : undefined,
    }));
    expect(ruleErrors(validate(segs), "R3015-8-stopovers").length).toBeGreaterThan(0);
  });

  it("passes with 2 stopovers", () => {
    const segs = CLASSIC_RTW.map((s, i) => ({
      ...s,
      departureTime:
        i === 0 ? base : i === 1 ? stop1Dep : i === 2 ? stop2Dep : undefined,
      arrivalTime: i === 0 ? stop1Arr : i === 1 ? stop2Arr : undefined,
    }));
    expect(ruleErrors(validate(segs), "R3015-8-stopovers")).toHaveLength(0);
  });
});
