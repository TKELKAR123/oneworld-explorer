import { describe, expect, it } from "vitest";
import { analyzeRoute, parseRoute } from "@oneworld-explorer/core";
import { evaluateR3015_0_swp_eu_via_asia } from "../../packages/core/src/rules/evaluators/R3015-0-fare-basis.js";
import { CLASSIC_RTW, ruleErrors, validate } from "../helpers/route.js";

describe("R3015-0-swp-eu-via-asia", () => {
  it("passes valid itinerary", () => {
    const result = validate(CLASSIC_RTW);
    expect(ruleErrors(result, "R3015-0-swp-eu-via-asia")).toHaveLength(0);
  });

  it("fails invalid itinerary", () => {
    const segments = [
      { from: "SYD", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "SYD" },
    ];
    const { itinerary } = parseRoute(segments);
    expect(itinerary).not.toBeNull();
    const analysis = analyzeRoute(itinerary!, { travelClass: "economy" });
    analysis.continentsVisited = ["south-west-pacific", "europe-middle-east"];
    analysis.continentCount = 2;

    const issues = evaluateR3015_0_swp_eu_via_asia({
      itinerary: itinerary!,
      options: { travelClass: "economy" },
      analysis,
    });
    expect(issues.some((i) => i.code === "R3015-0-swp-eu-via-asia")).toBe(true);
  });
});
