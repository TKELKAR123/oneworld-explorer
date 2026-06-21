import { describe, expect, it } from "vitest";
import { fanArcOpacity, fanArcStrokeWidth } from "../../apps/web/lib/globe/explore-fan-style";

describe("explore-fan-style", () => {
  it("maps carrier count to opacity", () => {
    expect(fanArcOpacity(1)).toBe(0.25);
    expect(fanArcOpacity(2)).toBe(0.4);
    expect(fanArcOpacity(4)).toBe(0.7);
  });

  it("widens stroke on hover", () => {
    expect(fanArcStrokeWidth(1, false)).toBeLessThan(fanArcStrokeWidth(1, true));
  });
});
