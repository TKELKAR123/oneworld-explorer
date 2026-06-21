import { describe, expect, it } from "vitest";
import {
  defaultMobileTab,
  globeMinHeight,
  plannerGridColumns,
  plannerPhase,
} from "../../apps/web/lib/planner/planner-phase";

describe("plannerPhase", () => {
  it("returns empty with no stops", () => {
    expect(plannerPhase([], [], null)).toBe("empty");
  });

  it("returns building with stops but no paste or outcome", () => {
    expect(plannerPhase(["LHR", "DFW"], [{}, {}], null)).toBe("building");
  });

  it("returns auditing when leg has carrier paste", () => {
    expect(
      plannerPhase(["LHR", "JFK"], [{ marketingCarrier: "BA" }], null),
    ).toBe("auditing");
  });

  it("returns auditing when validation outcome exists", () => {
    expect(
      plannerPhase(
        ["LHR", "JFK"],
        [{}, {}],
        { valid: true, outcome: "valid", issues: [], rulesVersion: "x" },
      ),
    ).toBe("auditing");
  });
});

describe("plannerGridColumns", () => {
  it("gives explore more width when empty", () => {
    const cols = plannerGridColumns("empty");
    expect(cols.build).toContain("32%");
  });

  it("gives build more width when auditing", () => {
    const cols = plannerGridColumns("auditing");
    expect(cols.build).toContain("52%");
  });
});

describe("globeMinHeight", () => {
  it("is taller in building than auditing", () => {
    expect(globeMinHeight("building")).toBeGreaterThan(globeMinHeight("auditing"));
  });
});

describe("defaultMobileTab", () => {
  it("defaults to plan when auditing", () => {
    expect(defaultMobileTab("auditing")).toBe("plan");
  });

  it("defaults to explore when empty", () => {
    expect(defaultMobileTab("empty")).toBe("explore");
  });
});
