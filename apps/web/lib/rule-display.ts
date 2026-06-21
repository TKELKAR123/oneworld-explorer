import type { RuleEvaluation, ValidationIssue } from "@oneworld-explorer/core";

export interface RuleDisplay {
  title: string;
  ruleId: string;
  pdfRef?: string;
  evidence?: string[];
}

export function formatRuleEvaluation(ev: RuleEvaluation): RuleDisplay {
  return {
    title: ev.naturalLanguage,
    ruleId: ev.ruleId,
    pdfRef: ev.pdfRef,
    evidence: ev.evidence,
  };
}

export function formatIssue(issue: ValidationIssue): RuleDisplay {
  return {
    title: issue.naturalLanguage ?? issue.message,
    ruleId: issue.code,
    pdfRef: issue.pdfRef,
    evidence: issue.evidence,
  };
}

export function categoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
