#!/usr/bin/env npx tsx
/**
 * Ensures every enforceInV01 rule in R3015-formal.yaml has:
 * - an evaluator in packages/core
 * - a test file under tests/rules/
 * - a row in docs/TRACEABILITY.md (warn if missing)
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const YAML_PATH = join(ROOT, "docs/rules/R3015-formal.yaml");
const EVALUATOR_INDEX = join(ROOT, "packages/core/src/rules/evaluators/index.ts");
const TRACE_PATH = join(ROOT, "docs/TRACEABILITY.md");

const doc = YAML.parse(readFileSync(YAML_PATH, "utf8")) as {
  rules: Array<{ id: string; enforceInV01: boolean; tests?: string[] }>;
};
const v01 = doc.rules.filter((r) => r.enforceInV01);
const evaluatorSrc = readFileSync(EVALUATOR_INDEX, "utf8");
const traceSrc = readFileSync(TRACE_PATH, "utf8");

const errors: string[] = [];

for (const rule of v01) {
  if (!evaluatorSrc.includes(`"${rule.id}"`)) {
    errors.push(`Missing evaluator for ${rule.id}`);
  }
  const testPath = join(ROOT, `tests/rules/${rule.id}.test.ts`);
  if (!existsSync(testPath)) {
    errors.push(`Missing test file tests/rules/${rule.id}.test.ts`);
  }
  if (!traceSrc.includes(rule.id)) {
    errors.push(`Missing TRACEABILITY.md row for ${rule.id}`);
  }
}

if (errors.length) {
  console.error("Traceability validation failed:\n" + errors.join("\n"));
  process.exit(1);
}
console.log(`Traceability OK (${v01.length} enforceInV01 rules)`);
