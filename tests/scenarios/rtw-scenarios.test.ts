import { describe, expect, it } from "vitest";
import { loadCatalog, runScenario } from "./run-scenario.js";

const catalog = loadCatalog();

describe("scenario catalog — integration (tier I)", () => {
  for (const fixture of catalog.scenarios) {
    it(`${fixture.id}: ${fixture.source}`, () => {
      const result = runScenario(fixture);
      if (fixture.id === "SC-001") {
        expect(result.analysis?.suggestedFareBasis).toBe("LONE4");
        expect(result.analysis?.continentCount).toBe(4);
      }
    });
  }
});

describe("scenario catalog coverage", () => {
  it("has at least 80 scenarios", () => {
    expect(catalog.scenarios.length).toBeGreaterThanOrEqual(80);
  });

  it("every scenario has required fields", () => {
    for (const s of catalog.scenarios) {
      expect(s.id).toMatch(/^SC-/);
      expect(s.segments.length).toBeGreaterThan(0);
      expect(typeof s.expectValid).toBe("boolean");
    }
  });
});
