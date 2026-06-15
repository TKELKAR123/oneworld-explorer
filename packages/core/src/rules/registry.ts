import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import type { FormalRule } from "./evaluators/types.js";
import { EVALUATOR_MAP } from "./evaluators/index.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const RULES_PATH = join(REPO_ROOT, "docs/rules/R3015-formal.yaml");

export interface RuleRegistryEntry extends FormalRule {
  evaluator?: string;
  tests: string[];
}

export interface RuleRegistry {
  rulesVersion: string;
  rules: RuleRegistryEntry[];
}

let cached: RuleRegistry | null = null;

export function loadRuleRegistry(): RuleRegistry {
  if (cached) return cached;
  const raw = readFileSync(RULES_PATH, "utf8");
  cached = YAML.parse(raw) as RuleRegistry;
  return cached;
}

export function getV01Rules(): RuleRegistryEntry[] {
  return loadRuleRegistry().rules.filter((r) => r.enforceInV01);
}

export function getRuleById(id: string): RuleRegistryEntry | undefined {
  return loadRuleRegistry().rules.find((r) => r.id === id);
}

export function hasEvaluator(id: string): boolean {
  return id in EVALUATOR_MAP;
}

export { EVALUATOR_MAP };
