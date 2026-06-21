import type { EvaluationContext } from "../../ontology/types.js";
import {
  isPermittedFlightSegment,
  itineraryHasCarrierData,
  resolveMarketingCarrier,
  resolveOperatingCarrier,
} from "../helpers/carriers.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_4_carriers(ctx: EvaluationContext) {
  if (!itineraryHasCarrierData(ctx.itinerary.segments)) return [];

  const issues = [];
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.surface) continue;
    if (!isPermittedFlightSegment(seg)) {
      const mkt = resolveMarketingCarrier(seg) ?? "?";
      const op = resolveOperatingCarrier(seg) ?? "?";
      issues.push(
        ruleError(
          "R3015-4-carriers",
          `Segment ${i + 1} (${mkt}/${op}) is not on an eligible oneworld Explorer carrier or permitted affiliate/codeshare (§4).`,
          { segmentIndex: i },
        ),
      );
    }
  }
  return issues;
}
