import { describe, expect, it } from "vitest";
import { buildValidationChecklist } from "../../apps/web/lib/validation-checklist";

describe("validation-checklist", () => {
  it("geometry only — shape complete, times pending", () => {
    const rows = buildValidationChecklist({
      result: {
        valid: true,
        outcome: "valid",
        blockingIssueCount: 0,
        warningCount: 0,
        rulesVersion: "x",
        issues: [],
        ruleEvaluations: [],
        analysis: null,
      },
      stops: ["JFK", "LHR", "JFK"],
      legTypes: ["flight", "flight"],
      legDetails: [{}, {}],
      legNetwork: [
        {
          legIndex: 0,
          from: "JFK",
          to: "LHR",
          feasibility: "direct",
          directCarriers: ["BA"],
          suggestedHubs: [],
          disclaimer: "",
        },
        {
          legIndex: 1,
          from: "LHR",
          to: "JFK",
          feasibility: "direct",
          directCarriers: ["BA"],
          suggestedHubs: [],
          disclaimer: "",
        },
      ],
      networkLoading: false,
      networkError: false,
      ticket: {},
    });
    const shape = rows.find((r) => r.id === "shape");
    const times = rows.find((r) => r.id === "times");
    expect(shape?.status).toBe("complete");
    expect(times?.status).toBe("pending");
  });

  it("partial times shows partial status", () => {
    const rows = buildValidationChecklist({
      result: null,
      stops: ["JFK", "LHR", "JFK"],
      legTypes: ["flight", "flight"],
      legDetails: [
        { departureTime: "2026-01-01T10:00:00Z", arrivalTime: "2026-01-01T20:00:00Z" },
        {},
      ],
      legNetwork: [],
      networkLoading: true,
      networkError: false,
      ticket: {},
    });
    expect(rows.find((r) => r.id === "times")?.status).toBe("partial");
  });
});
