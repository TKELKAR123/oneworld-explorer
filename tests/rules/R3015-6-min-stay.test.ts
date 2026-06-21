import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-6-min-stay", () => {
  const t0 = "2026-06-01T10:00:00Z";
  const tShort = "2026-06-05T10:00:00Z";
  const tLong = "2026-06-15T10:00:00Z";

  it("fails TC1 origin under 10 days", () => {
    const segs = CLASSIC_RTW.map((s, i) => ({
      ...s,
      departureTime: i === 0 ? t0 : i === 4 ? tShort : undefined,
    }));
    expect(ruleErrors(validate(segs), "R3015-6-min-stay").length).toBeGreaterThan(0);
  });

  it("passes TC1 origin with 10+ days", () => {
    const segs = CLASSIC_RTW.map((s, i) => ({
      ...s,
      departureTime: i === 0 ? t0 : i === 4 ? tLong : undefined,
    }));
    expect(ruleErrors(validate(segs), "R3015-6-min-stay")).toHaveLength(0);
  });
});
