import { describe, expect, it } from "vitest";
import {
  EVALUATOR_MAP,
  getRuleById,
  getV01Rules,
  hasEvaluator,
  loadRuleRegistry,
} from "../src/rules/registry.js";

describe("loadRuleRegistry", () => {
  it("loads R3015-formal.yaml with expected version", () => {
    const reg = loadRuleRegistry();
    expect(reg.rulesVersion).toBe("2026-02-27");
    expect(reg.rules.length).toBeGreaterThan(40);
  });

  it("every enforceInV01 rule has naturalLanguage and pdfRef", () => {
    for (const rule of getV01Rules()) {
      expect(rule.naturalLanguage?.length).toBeGreaterThan(10);
      expect(rule.pdfRef).toBeTruthy();
    }
  });

  it("every enforceInV01 rule has a registered evaluator", () => {
    for (const rule of getV01Rules()) {
      expect(hasEvaluator(rule.id)).toBe(true);
      expect(EVALUATOR_MAP[rule.id]).toBeTypeOf("function");
    }
  });

  it("lookup by id returns R3015-4a", () => {
    const rule = getRuleById("R3015-4a");
    expect(rule?.category).toBe("routing");
    expect(rule?.enforceInV01).toBe(true);
  });
});
