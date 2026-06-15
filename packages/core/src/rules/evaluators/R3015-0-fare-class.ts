import type { EvaluationContext } from "../../ontology/types.js";
import type { TravelClass } from "../../ontology/types.js";
import { ruleError } from "./utils.js";

const CLASS_RANK: Record<TravelClass, number> = {
  economy: 1,
  "premium-economy": 2,
  business: 3,
  first: 4,
};

export function evaluateR3015_0_fare_class(ctx: EvaluationContext) {
  const { itinerary, options } = ctx;
  const declared = options.travelClass ?? "economy";
  let highest: TravelClass = declared;

  for (const seg of itinerary.segments) {
    if (seg.surface) continue;
    const segClass = seg.bookingClass ?? declared;
    if (CLASS_RANK[segClass] > CLASS_RANK[highest]) highest = segClass;
  }

  if (CLASS_RANK[highest] > CLASS_RANK[declared]) {
    return [
      ruleError(
        "R3015-0-fare-class",
        `Itinerary includes ${highest} travel but declared class is ${declared}; fare is based on highest class travelled.`,
        { evidence: [`chargedClass=${highest}`, `declaredClass=${declared}`] },
      ),
    ];
  }
  return [];
}
