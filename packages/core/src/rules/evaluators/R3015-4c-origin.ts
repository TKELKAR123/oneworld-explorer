import type { EvaluationContext } from "../../ontology/types.js";
import {
  detectOpenJawType,
  hasTicketedOriginReturnConnector,
  openJawPermitted,
} from "../helpers/open-jaw.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_4c_origin(ctx: EvaluationContext) {
  const { itinerary } = ctx;
  const origin = itinerary.points[0]!;
  const termination = itinerary.points[itinerary.points.length - 1]!;

  if (hasTicketedOriginReturnConnector(itinerary)) {
    return [
      ruleError(
        "R3015-4c-origin",
        `Open jaw may not use a ticketed flight sector ${origin.iata} → ${termination.iata}; the origin–destination gap must be at passenger expense (§4(c)).`,
      ),
    ];
  }

  if (!openJawPermitted(itinerary)) {
    return [
      ruleError(
        "R3015-4c-origin",
        `Route must start and end at the same airport (${origin.iata} ≠ ${termination.iata}) unless a permitted origin–destination open jaw under §4(c)(a)–(g) applies.`,
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
