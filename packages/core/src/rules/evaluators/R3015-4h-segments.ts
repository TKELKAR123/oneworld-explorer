import type { EvaluationContext } from "../../ontology/types.js";
import { EXPLORER_RULES } from "../constants.js";
import { continentsCharged } from "../helpers/pricing.js";
import {
  freeFlightSegmentsUsed,
  segmentLimit,
} from "../helpers/segments.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_4h_segment_count(ctx: EvaluationContext) {
  const segCount = ctx.itinerary.segments.length;
  const issues = [];

  if (segCount < EXPLORER_RULES.minSegments) {
    issues.push(
      ruleError(
        "R3015-4h-segment-count",
        `Minimum ${EXPLORER_RULES.minSegments} segments required; found ${segCount}.`,
      ),
    );
  }
  if (segCount > EXPLORER_RULES.maxSegments) {
    issues.push(
      ruleError(
        "R3015-4h-segment-count",
        `Maximum ${EXPLORER_RULES.maxSegments} segments allowed; found ${segCount}.`,
      ),
    );
  }
  return issues;
}

export function evaluateR3015_4h_continent_limits(ctx: EvaluationContext) {
  const charged = continentsCharged(ctx.itinerary);
  const issues = [];

  for (const continent of charged) {
    const used = freeFlightSegmentsUsed(continent, ctx.itinerary);
    const limit = segmentLimit(continent);
    if (used > limit) {
      issues.push(
        ruleError(
          "R3015-4h-continent-limits",
          `Free flight segments in ${continent} limited to ${limit}; found ${used}.`,
          { evidence: [`freeFlightSegmentsUsed(${continent})=${used}`, `limit=${limit}`] },
        ),
      );
    }
  }
  return issues;
}
