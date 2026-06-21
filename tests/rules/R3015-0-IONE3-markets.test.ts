import { describe, expect, it } from "vitest";
import { evaluateR3015_0_IONE3_markets } from "../../packages/core/src/rules/evaluators/R3015-0-ticketing-meta.js";
import { ruleErrors, validate } from "../helpers/route.js";

const THREE_CONTINENT_BUSINESS = [
  { from: "JFK", to: "LHR" },
  { from: "LHR", to: "HKG" },
  { from: "HKG", to: "JFK" },
];

describe("R3015-0-IONE3-markets", () => {
  it("does not apply when fare basis is DONE3", () => {
    const result = validate(THREE_CONTINENT_BUSINESS, {
      travelClass: "business",
      ticket: { saleMarket: "BR" },
    });
    expect(result.analysis?.suggestedFareBasis).toBe("DONE3");
    expect(ruleErrors(result, "R3015-0-IONE3-markets")).toHaveLength(0);
  });

  it("fails IONE3 from disallowed market", () => {
    const parse = validate(THREE_CONTINENT_BUSINESS, { travelClass: "business" });
    const issues = evaluateR3015_0_IONE3_markets({
      itinerary: { segments: THREE_CONTINENT_BUSINESS, points: [] },
      options: { travelClass: "business", ticket: { saleMarket: "BR" } },
      analysis: { ...parse.analysis!, suggestedFareBasis: "IONE3" },
      ticket: { saleMarket: "BR" },
    });
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]?.code).toBe("R3015-0-IONE3-markets");
  });

  it("passes IONE3 from allowed market", () => {
    const parse = validate(THREE_CONTINENT_BUSINESS, { travelClass: "business" });
    const issues = evaluateR3015_0_IONE3_markets({
      itinerary: { segments: THREE_CONTINENT_BUSINESS, points: [] },
      options: { travelClass: "business", ticket: { saleMarket: "US" } },
      analysis: { ...parse.analysis!, suggestedFareBasis: "IONE3" },
      ticket: { saleMarket: "US" },
    });
    expect(issues).toHaveLength(0);
  });
});
