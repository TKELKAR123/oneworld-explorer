import { describe, expect, it } from "vitest";
import {
  continentsCharged,
  swpEuViaAsiaPattern,
  validateThreeContinentOrigin,
} from "../src/rules/helpers/pricing.js";
import { parseRoute } from "../src/parse-route.js";

describe("pricing helpers", () => {
  it("detects SWP↔EU direct segment pattern", () => {
    const { itinerary } = parseRoute([
      { from: "LHR", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "LHR" },
    ]);
    expect(itinerary).not.toBeNull();
    expect(swpEuViaAsiaPattern(itinerary!)).toBe(true);
    const charged = continentsCharged(itinerary!);
    expect(charged).toContain("asia");
    expect(charged).toContain("south-west-pacific");
    expect(charged).toContain("europe-middle-east");
  });

  it("allows 3-continent origin from North America", () => {
    const { itinerary } = parseRoute(["JFK", "LHR", "DXB", "JFK"]);
    expect(validateThreeContinentOrigin(itinerary!, 3)).toBe(true);
  });
});
