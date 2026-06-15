import type { EvaluationContext, ValidationIssue } from "../ontology/types.js";
import { EVALUATOR_MAP, V01_EVALUATOR_ORDER } from "./evaluators/index.js";
import { getRuleById, loadRuleRegistry } from "./registry.js";

function enrichIssue(issue: ValidationIssue): ValidationIssue {
  const rule = getRuleById(issue.code);
  if (!rule) return issue;
  return {
    ...issue,
    pdfRef: rule.pdfRef,
    category: rule.category,
    naturalLanguage: rule.naturalLanguage.trim(),
  };
}

export function evaluateRules(ctx: EvaluationContext): ValidationIssue[] {
  loadRuleRegistry();
  const issues: ValidationIssue[] = [];

  for (const ruleId of V01_EVALUATOR_ORDER) {
    const rule = getRuleById(ruleId);
    if (!rule?.enforceInV01) continue;
    const evaluator = EVALUATOR_MAP[ruleId];
    if (!evaluator) continue;
    issues.push(...evaluator(ctx).map(enrichIssue));
  }

  return issues;
}

export { EVALUATOR_MAP, V01_EVALUATOR_ORDER };
