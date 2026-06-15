import type { EvaluationContext } from "../../ontology/types.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_4i_duplicate_sector(ctx: EvaluationContext) {
  const { itinerary } = ctx;
  const cityPairs = new Map<string, number>();
  const issues = [];

  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    if (seg.surface) continue;
    const from = itinerary.points[i]!;
    const to = itinerary.points[i + 1]!;
    const key = `${from.city}→${to.city}`;
    const prev = cityPairs.get(key) ?? 0;
    if (prev > 0) {
      issues.push(
        ruleError(
          "R3015-4i-duplicate-sector",
          `Duplicate city pair in same direction: ${from.city} → ${to.city}.`,
          { segmentIndex: i },
        ),
      );
    }
    cityPairs.set(key, prev + 1);
  }
  return issues;
}
