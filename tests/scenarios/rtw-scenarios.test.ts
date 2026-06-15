import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { validateRoute } from "@oneworld-explorer/core";

interface ScenarioFixture {
  id: string;
  source: string;
  segments: Array<{ from: string; to: string; surface?: boolean }>;
  expectValid: boolean;
  expectRuleIds?: string[];
  expectIssueCodes?: string[];
}

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const fixtures = readdirSync(fixturesDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(fixturesDir, f), "utf8")) as ScenarioFixture);

function runScenario(fixture: ScenarioFixture) {
  const result = validateRoute(fixture.segments, { travelClass: "economy" });
  expect(result.valid).toBe(fixture.expectValid);
  if (fixture.expectRuleIds?.length) {
    for (const ruleId of fixture.expectRuleIds) {
      expect(result.issues.some((i) => i.code === ruleId)).toBe(true);
    }
  }
  if (fixture.expectIssueCodes?.length) {
    for (const code of fixture.expectIssueCodes) {
      expect(result.issues.some((i) => i.code === code)).toBe(true);
    }
  }
  return result;
}

describe("scenario integration — FlyerTalk-style fixtures", () => {
  for (const fixture of fixtures) {
    it(`${fixture.id}: ${fixture.source}`, () => {
      const result = runScenario(fixture);
      if (fixture.id === "SC-001") {
        expect(result.analysis?.suggestedFareBasis).toBe("LONE4");
        expect(result.analysis?.continentCount).toBe(4);
      }
    });
  }
});

describe("scenario coverage", () => {
  it("runs at least 6 encoded product scenarios", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(6);
  });
});
