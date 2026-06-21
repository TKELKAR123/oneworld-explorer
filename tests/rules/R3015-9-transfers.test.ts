import { describe, expect, it } from "vitest";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-9-transfers", () => {
  it("passes eligible carriers on timed segments", () => {
    const segs = CLASSIC_RTW.map((s, i) =>
      i < 2
        ? {
            ...s,
            marketingCarrier: "BA",
            operatingCarrier: "BA",
            departureTime: "2026-06-01T10:00:00Z",
            arrivalTime: "2026-06-01T14:00:00Z",
          }
        : s,
    );
    expect(ruleErrors(validate(segs), "R3015-9-transfers")).toHaveLength(0);
  });
});
