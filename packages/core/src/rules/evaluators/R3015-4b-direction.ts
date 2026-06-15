import type { EvaluationContext } from "../../ontology/types.js";
import { tcDirectionValid } from "../helpers/geometry.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_4b_direction(ctx: EvaluationContext) {
  const tcSeq = ctx.itinerary.points.map((p) => p.zone);
  if (!tcDirectionValid(tcSeq)) {
    return [
      ruleError(
        "R3015-4b-direction",
        "Itinerary backtracks between traffic zones (TC1→TC2→TC3 must move forward).",
        { evidence: tcSeq },
      ),
    ];
  }
  return [];
}
