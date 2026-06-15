import type { EvaluationContext } from "../../ontology/types.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_4d_no_via_origin(ctx: EvaluationContext) {
  const { itinerary } = ctx;
  const origin = itinerary.points[0]!;
  const issues = [];

  for (let i = 1; i < itinerary.points.length - 1; i++) {
    if (itinerary.points[i]!.iata === origin.iata) {
      issues.push(
        ruleError(
          "R3015-4d-no-via-origin",
          `Travel may not be via the point of origin (${origin.iata}) except as origin or termination.`,
          { segmentIndex: i - 1 },
        ),
      );
    }
  }
  return issues;
}
