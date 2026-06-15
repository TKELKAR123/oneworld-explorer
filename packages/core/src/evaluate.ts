import { analyzeRoute } from "./analyze-route.js";
import type {
  RouteInput,
  ValidationResult,
  ValidateOptions,
} from "./ontology/types.js";
import { parseRoute } from "./parse-route.js";
import { evaluateRules } from "./rules/evaluate-rules.js";
import { RULES_VERSION } from "./rules/constants.js";

export function validateRoute(
  input: RouteInput,
  options: ValidateOptions = {},
): ValidationResult {
  const { itinerary, issues: parseIssues } = parseRoute(input);

  if (!itinerary) {
    return {
      valid: false,
      rulesVersion: RULES_VERSION,
      issues: parseIssues,
      analysis: null,
    };
  }

  const analysis = analyzeRoute(itinerary, options);
  const ruleIssues = evaluateRules({ itinerary, options, analysis });
  const issues = [...parseIssues, ...ruleIssues];

  return {
    valid: issues.every((i) => i.severity !== "error"),
    rulesVersion: RULES_VERSION,
    issues,
    analysis,
  };
}

export { parseRoute } from "./parse-route.js";
export { analyzeRoute } from "./analyze-route.js";
export { validateRoute as evaluate };
