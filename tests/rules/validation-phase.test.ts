import { describe, expect, it } from "vitest";
import { parseRoute, validateRoute } from "@oneworld-explorer/core";
import {
  BUILDING_SUPPRESSED_CODES,
  inferValidationPhase,
  shouldSuppressInBuilding,
} from "@oneworld-explorer/core";

describe("validation phase inference", () => {
  it("marks short drafts as building", () => {
    const { itinerary } = parseRoute(["OSL", "DOH"]);
    expect(itinerary).not.toBeNull();
    const analysis = validateRoute([{ from: "OSL", to: "DOH" }]).analysis!;
    expect(inferValidationPhase(itinerary!, analysis)).toBe("building");
  });

  it("marks classic RTW as ticketReady", () => {
    const segments = [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
    ];
    const result = validateRoute(segments);
    expect(result.validationPhase).toBe("ticketReady");
  });

  it("suppresses R3015-4a while building", () => {
    const result = validateRoute([{ from: "OSL", to: "DOH" }]);
    expect(result.validationPhase).toBe("building");
    expect(result.issues.some((i) => i.code === "R3015-4a")).toBe(false);
    expect(result.suppressedIssueCodes?.includes("R3015-4a")).toBe(true);
  });

  it("exposes guidance issues in building mode", () => {
    const result = validateRoute([{ from: "OSL", to: "DOH" }]);
    expect(result.guidanceIssues?.length).toBeGreaterThan(0);
  });

  it("forces ticketReady when validationPhase override set", () => {
    const result = validateRoute(
      [{ from: "JFK", to: "LHR" }, { from: "LHR", to: "JFK" }],
      { validationPhase: "ticketReady" },
    );
    expect(result.validationPhase).toBe("ticketReady");
    expect(result.issues.some((i) => i.code === "R3015-4h-segment-count")).toBe(true);
  });
});

describe("shouldSuppressInBuilding", () => {
  it("includes ocean and segment minimum rules", () => {
    expect(shouldSuppressInBuilding("R3015-4a")).toBe(true);
    expect(BUILDING_SUPPRESSED_CODES.has("R3015-4h-segment-count")).toBe(true);
    expect(shouldSuppressInBuilding("R3015-4e-intercon")).toBe(false);
  });
});
