import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";
import { validateRoute } from "@oneworld-explorer/core";
import type {
  RouteSegment,
  TicketContext,
  TravelClass,
  ValidationOutcome,
} from "@oneworld-explorer/core";

export interface ScenarioCatalogEntry {
  id: string;
  source: string;
  tags?: string[];
  taxonomy?: Record<string, string>;
  travelClass?: TravelClass;
  segments: RouteSegment[];
  ticket?: TicketContext;
  expectValid: boolean;
  expectOutcome?: ValidationOutcome;
  validationPhase?: "building" | "ticketReady";
  expectRuleIds?: string[];
  expectIssueCodes?: string[];
  minPassedRules?: number;
  expectOriginReturnMode?: string;
  expectNotApplicableRules?: string[];
  expectActiveRules?: string[];
  rulesTouched?: string[];
}

export interface ScenarioCatalog {
  version: number;
  scenarios: ScenarioCatalogEntry[];
}

const catalogPath = join(dirname(fileURLToPath(import.meta.url)), "catalog.json");

export function loadCatalog(): ScenarioCatalog {
  const raw = JSON.parse(readFileSync(catalogPath, "utf8")) as
    | ScenarioCatalog
    | ScenarioCatalogEntry[];
  if (Array.isArray(raw)) {
    return { version: 1, scenarios: raw };
  }
  return raw;
}

export function runScenario(fixture: ScenarioCatalogEntry) {
  const result = validateRoute(fixture.segments, {
    travelClass: fixture.travelClass ?? "economy",
    ticket: fixture.ticket,
    validationPhase: fixture.validationPhase,
  });

  expect(result.valid).toBe(fixture.expectValid);
  if (fixture.expectOutcome) {
    expect(result.outcome).toBe(fixture.expectOutcome);
  }
  if (fixture.expectRuleIds?.length) {
    for (const ruleId of fixture.expectRuleIds) {
      expect(
        result.issues.some((i) => i.code === ruleId),
        `${fixture.id}: expected issue ${ruleId}`,
      ).toBe(true);
    }
  }
  if (fixture.expectIssueCodes?.length) {
    for (const code of fixture.expectIssueCodes) {
      expect(result.issues.some((i) => i.code === code)).toBe(true);
    }
  }
  if (fixture.minPassedRules !== undefined) {
    const passed = result.ruleEvaluations.filter((r) => r.passed).length;
    expect(passed).toBeGreaterThanOrEqual(fixture.minPassedRules);
  }
  if (fixture.expectOriginReturnMode) {
    expect(result.analysis?.originReturn.mode).toBe(fixture.expectOriginReturnMode);
  }
  if (fixture.expectNotApplicableRules?.length) {
    for (const ruleId of fixture.expectNotApplicableRules) {
      const ev = result.ruleEvaluations.find((r) => r.ruleId === ruleId);
      expect(ev?.applicability, `${fixture.id}: ${ruleId} should be notApplicable`).toBe(
        "notApplicable",
      );
    }
  }
  if (fixture.expectActiveRules?.length) {
    for (const ruleId of fixture.expectActiveRules) {
      const ev = result.ruleEvaluations.find((r) => r.ruleId === ruleId);
      expect(ev?.applicability, `${fixture.id}: ${ruleId} should be active`).toBe("active");
    }
  }
  return result;
}

export function scenariosByTag(tag: string): ScenarioCatalogEntry[] {
  return loadCatalog().scenarios.filter((s) => s.tags?.includes(tag));
}
