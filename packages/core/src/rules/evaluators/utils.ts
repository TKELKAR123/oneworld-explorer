import type { ValidationIssue } from "../../ontology/types.js";

export function ruleError(
  code: string,
  message: string,
  extra?: Partial<ValidationIssue>,
): ValidationIssue {
  return { code, severity: "error", message, ...extra };
}

export function ruleWarning(
  code: string,
  message: string,
  extra?: Partial<ValidationIssue>,
): ValidationIssue {
  return { code, severity: "warning", message, ...extra };
}
