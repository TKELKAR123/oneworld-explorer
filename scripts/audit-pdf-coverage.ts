#!/usr/bin/env npx tsx
/**
 * Guardrail: every enforceInV01 rule must have a § pdfRef and semantic audit row.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const YAML_PATH = join(ROOT, "docs/rules/R3015-formal.yaml");
const AUDIT_PATH = join(ROOT, "docs/audits/R3015-pdf-audit.md");

const ALLOWED_SEMANTIC = new Set([
  "verified",
  "implementation-bug",
  "ambiguous",
  "deferred-v02",
]);

const doc = YAML.parse(readFileSync(YAML_PATH, "utf8")) as {
  rules: Array<{ id: string; enforceInV01: boolean; pdfRef?: string }>;
};

const audit = readFileSync(AUDIT_PATH, "utf8");
const errors: string[] = [];

function semanticStatus(ruleId: string): string | null {
  const rowRe = new RegExp(
    `\\|\\s*${ruleId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\|[^|]*\\|\\s*([^|]+?)\\s*\\|`,
  );
  const m = audit.match(rowRe);
  return m?.[1]?.trim() ?? null;
}

for (const rule of doc.rules.filter((r) => r.enforceInV01)) {
  if (!rule.pdfRef?.includes("§")) {
    errors.push(`${rule.id} missing § pdfRef`);
  }
  if (!audit.includes(rule.id)) {
    errors.push(`${rule.id} missing from docs/audits/R3015-pdf-audit.md`);
    continue;
  }
  const status = semanticStatus(rule.id);
  if (!status) {
    errors.push(`${rule.id} missing semantic status row in audit table`);
  } else if (!ALLOWED_SEMANTIC.has(status)) {
    errors.push(`${rule.id} invalid semantic status "${status}"`);
  } else if (status === "implementation-bug") {
    errors.push(`${rule.id} marked implementation-bug in audit doc`);
  }
}

if (errors.length) {
  console.error("audit-pdf-coverage failed:\n" + errors.join("\n"));
  process.exit(1);
}

console.log(
  `audit-pdf-coverage OK (${doc.rules.filter((r) => r.enforceInV01).length} v01 rules, semantic audit clean)`,
);
