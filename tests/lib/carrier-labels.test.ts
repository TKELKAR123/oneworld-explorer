import { describe, expect, it } from "vitest";
import { carrierName, formatCarrierList } from "../../apps/web/lib/carrier-labels";

describe("carrier-labels", () => {
  it("maps BA to British Airways", () => {
    expect(carrierName("BA")).toBe("British Airways");
  });

  it("returns code for unknown carrier", () => {
    expect(carrierName("ZZ")).toBe("ZZ");
  });

  it("formats list with overflow", () => {
    expect(formatCarrierList(["BA", "AA", "AY", "IB", "MH"], 3)).toBe(
      "British Airways, American Airlines, Finnair (+2 more)",
    );
  });
});
