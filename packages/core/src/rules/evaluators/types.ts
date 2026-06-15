import type { EvaluationContext, ValidationIssue } from "../../ontology/types.js";

export type RuleEvaluator = (ctx: EvaluationContext) => ValidationIssue[];

export interface FormalRule {
  id: string;
  pdfRef: string;
  naturalLanguage: string;
  category: string;
  enforceInV01: boolean;
  enforceInV02: boolean;
}
