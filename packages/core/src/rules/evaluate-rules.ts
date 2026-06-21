import type { EvaluationContext, ValidationIssue } from "../ontology/types.js";
import { EVALUATOR_MAP, V01_EVALUATOR_ORDER } from "./evaluators/index.js";
import { enrichRuleEvaluation } from "./applicability.js";
import { buildPassEvidence } from "./helpers/pass-evidence.js";
import { getRuleById, loadRuleRegistry } from "./registry.js";
import type { RuleEvaluation } from "../ontology/types.js";

function enrichIssue(issue: ValidationIssue): ValidationIssue {
  const rule = getRuleById(issue.code);
  if (!rule) return issue;
  return {
    ...issue,
    pdfRef: rule.pdfRef,
    category: issue.category ?? rule.category,
    naturalLanguage: rule.naturalLanguage.trim(),
  };
}

export function evaluateRules(ctx: EvaluationContext): ValidationIssue[] {
  return evaluateRulesWithTrace(ctx).issues;
}

export function evaluateRulesWithTrace(ctx: EvaluationContext): {
  issues: ValidationIssue[];
  ruleEvaluations: RuleEvaluation[];
} {
  loadRuleRegistry();
  const issues: ValidationIssue[] = [];
  const ruleEvaluations: RuleEvaluation[] = [];

  for (const ruleId of V01_EVALUATOR_ORDER) {
    const rule = getRuleById(ruleId);
    if (!rule?.enforceInV01) continue;
    const evaluator = EVALUATOR_MAP[ruleId];
    if (!evaluator) continue;

    const rawIssues = evaluator(ctx).map(enrichIssue);

    if (rawIssues.length === 0) {
      ruleEvaluations.push(
        enrichRuleEvaluation(
          {
            ruleId,
            passed: true,
            severity: "info",
            category: rule.category,
            pdfRef: rule.pdfRef,
            naturalLanguage: rule.naturalLanguage.trim(),
            evidence: buildPassEvidence(ruleId, ctx),
          },
          ctx,
        ),
      );
    } else {
      for (const issue of rawIssues) {
        ruleEvaluations.push(
          enrichRuleEvaluation(
            {
              ruleId: issue.code,
              passed: false,
              severity: issue.severity === "warning" ? "warning" : "error",
              category: issue.category ?? rule.category,
              pdfRef: issue.pdfRef ?? rule.pdfRef,
              naturalLanguage: issue.naturalLanguage ?? rule.naturalLanguage.trim(),
              message: issue.message,
              evidence: issue.evidence,
              segmentIndices:
                issue.segmentIndex !== undefined ? [issue.segmentIndex] : undefined,
            },
            ctx,
          ),
        );
        issues.push(issue);
      }
    }
  }

  return { issues, ruleEvaluations };
}

export { EVALUATOR_MAP, V01_EVALUATOR_ORDER };
