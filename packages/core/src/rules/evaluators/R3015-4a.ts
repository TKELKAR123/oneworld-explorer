import type { EvaluationContext } from "../../ontology/types.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_4a(ctx: EvaluationContext) {
  const { analysis } = ctx;
  const issues = [];
  const atlCount = analysis.segments.filter((s) => s.crossesAtlantic).length;
  const pacCount = analysis.segments.filter((s) => s.crossesPacific).length;

  if (atlCount !== 1) {
    issues.push(
      ruleError(
        "R3015-4a",
        `Exactly one Atlantic crossing required; found ${atlCount}.`,
        { evidence: [`crossesAtlantic=${atlCount}`] },
      ),
    );
  }
  if (pacCount !== 1) {
    issues.push(
      ruleError(
        "R3015-4a",
        `Exactly one Pacific crossing required; found ${pacCount}.`,
        { evidence: [`crossesPacific=${pacCount}`] },
      ),
    );
  }
  return issues;
}
