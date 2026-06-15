import type { EvaluationContext } from "../../ontology/types.js";
import { detectOpenJawType, openJawPermitted } from "../helpers/open-jaw.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_4c_origin(ctx: EvaluationContext) {
  const { itinerary } = ctx;
  const origin = itinerary.points[0]!;
  const termination = itinerary.points[itinerary.points.length - 1]!;

  if (!openJawPermitted(itinerary)) {
    return [
      ruleError(
        "R3015-4c-origin",
        `Route must start and end at the same airport (${origin.iata} ≠ ${termination.iata}) unless a permitted origin–destination surface open jaw applies.`,
      ),
    ];
  }
  if (origin.iata !== termination.iata) {
    const jawType = detectOpenJawType(itinerary);
    if (!jawType) {
      return [
        ruleError(
          "R3015-4c-origin",
          "Open jaw between origin and termination is not permitted under §4(c).",
        ),
      ];
    }
  }
  return [];
}
