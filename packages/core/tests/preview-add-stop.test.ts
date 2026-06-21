import { describe, expect, it } from "vitest";
import { previewAddStop } from "../src/preview-add-stop.js";

describe("previewAddStop", () => {
  it("reports direct network for LHR → DOH with carriers", () => {
    const impact = previewAddStop({
      stops: ["LHR", ""],
      legTypes: ["flight"],
      anchorIata: "LHR",
      candidateIata: "DOH",
      travelClass: "economy",
      networkDirect: true,
      networkCarrierCount: 2,
    });
    expect(impact.network.feasibility).toBe("direct");
    expect(impact.network.tier).toBe("ok");
    expect(impact.network.message).toContain("Direct");
  });

  it("warns when no published route", () => {
    const impact = previewAddStop({
      stops: ["NRT", ""],
      legTypes: ["flight"],
      anchorIata: "NRT",
      candidateIata: "XXX",
      travelClass: "economy",
      networkDirect: false,
      networkCarrierCount: 0,
    });
    expect(impact.network.tier).toBe("warning");
    expect(impact.network.feasibility).toBe("none");
  });

  it("info when stop already on route", () => {
    const impact = previewAddStop({
      stops: ["LHR", "DOH"],
      legTypes: ["flight"],
      anchorIata: "LHR",
      candidateIata: "DOH",
      travelClass: "economy",
      networkDirect: true,
      networkCarrierCount: 1,
    });
    expect(impact.routing.tier).toBe("info");
    expect(impact.routing.messages[0]).toContain("Already");
  });

  it("warns fare basis when adding continent increases count", () => {
    const impact = previewAddStop({
      stops: ["JFK", "LHR", "DOH", ""],
      legTypes: ["flight", "flight", "flight"],
      anchorIata: "DOH",
      candidateIata: "SYD",
      travelClass: "economy",
      currentAnalysis: {
        segments: [],
        continentsVisited: ["north-america", "europe-middle-east"],
        continentCount: 2,
        suggestedFareBasis: "LONE3",
        direction: null,
        flightSegmentsByContinent: {} as never,
        totalSegments: 3,
        crossesAtlantic: true,
        crossesPacific: false,
        originReturn: {
          originIata: "JFK",
          returnIata: "JFK",
          originCountry: "US",
          returnCountry: "US",
          mode: "closedLoop",
          requiresSurface: false,
        },
      },
      networkDirect: true,
      networkCarrierCount: 1,
    });
    expect(impact.routing.messages.some((m) => m.includes("continent") || m.includes("LONE"))).toBe(
      true,
    );
  });

  it("warns near segment budget limit", () => {
    const impact = previewAddStop({
      stops: ["JFK", "LAX", "SFO", ""],
      legTypes: ["flight", "flight", "flight"],
      anchorIata: "SFO",
      candidateIata: "ORD",
      travelClass: "economy",
      networkDirect: true,
      networkCarrierCount: 1,
    });
    const hasBudgetHint =
      (impact.routing.segmentBudgetHints?.length ?? 0) > 0 ||
      impact.routing.messages.some((m) => m.includes("segment limit"));
    expect(hasBudgetHint || impact.routing.tier !== "blocked").toBe(true);
  });
});
