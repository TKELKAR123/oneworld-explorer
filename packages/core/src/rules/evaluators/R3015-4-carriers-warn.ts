import { ELIGIBLE_CARRIERS } from "../constants.js";
import type { EvaluationContext } from "../../ontology/types.js";
import { ruleWarning } from "./utils.js";

export function evaluateR3015_4_carriers_warn(ctx: EvaluationContext) {
  const issues = [];
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.surface) continue;
    const carrier = seg.marketingCarrier?.trim().toUpperCase();
    if (!carrier) continue;
    if (!ELIGIBLE_CARRIERS.has(carrier)) {
      issues.push(
        ruleWarning(
          "R3015-4-carriers-warn",
          `Marketing carrier ${carrier} on segment ${i + 1} is not an eligible oneworld Explorer carrier (schedule enforcement in v0.2).`,
          { segmentIndex: i },
        ),
      );
    }
  }
  return issues;
}
