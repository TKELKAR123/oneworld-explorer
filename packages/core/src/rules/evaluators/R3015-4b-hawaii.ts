import type { EvaluationContext } from "../../ontology/types.js";
import {
  isHawaii,
  isNorthAmericaNonHawaii,
} from "../helpers/geometry.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_4b_hawaii(ctx: EvaluationContext) {
  const { itinerary } = ctx;
  const issues = [];

  for (let i = 0; i < itinerary.segments.length; i++) {
    for (let j = i + 1; j < itinerary.segments.length; j++) {
      const s1From = itinerary.points[i]!;
      const s1To = itinerary.points[i + 1]!;
      const s2From = itinerary.points[j]!;
      const s2To = itinerary.points[j + 1]!;
      const pattern1 =
        isHawaii(s1From) &&
        isNorthAmericaNonHawaii(s1To) &&
        isNorthAmericaNonHawaii(s2From) &&
        isHawaii(s2To);
      const pattern2 =
        isNorthAmericaNonHawaii(s1From) &&
        isHawaii(s1To) &&
        isHawaii(s2From) &&
        isNorthAmericaNonHawaii(s2To);
      if (pattern1 || pattern2) {
        issues.push(
          ruleError(
            "R3015-4b-hawaii",
            "Backtracking between Hawaii and other North American points is not permitted.",
            { segmentIndex: j },
          ),
        );
      }
    }
  }
  return issues;
}
