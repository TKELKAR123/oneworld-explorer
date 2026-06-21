import { describe, expect, it } from "vitest";
import { buildReturnGuide } from "../../packages/core/src/rules/helpers/return-guide.js";

describe("return-guide", () => {
  it("OSL lists Norway country option with TOS example", () => {
    const guide = buildReturnGuide("OSL");
    expect(guide).not.toBeNull();
    expect(guide!.originCountry).toBe("NO");
    const withinCountry = guide!.options.find((o) => o.type === "within-origin-country");
    expect(withinCountry).toBeDefined();
    expect(withinCountry!.exampleIatas).toContain("TOS");
    expect(guide!.summaryHint).toMatch(/Norway/i);
  });

  it("JFK includes closed loop and US/Canada options", () => {
    const guide = buildReturnGuide("JFK");
    expect(guide!.options.some((o) => o.type === "closedLoop")).toBe(true);
    expect(guide!.options.some((o) => o.type === "us-canada")).toBe(true);
  });
});
