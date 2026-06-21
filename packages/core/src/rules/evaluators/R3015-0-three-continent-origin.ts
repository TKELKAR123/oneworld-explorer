import { validateThreeContinentOrigin } from "../helpers/pricing.js";
import type { EvaluationContext } from "../../ontology/types.js";
import { continentsCharged } from "../helpers/pricing.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_0_three_continent_origin(ctx: EvaluationContext) {
  const chargedCount = continentsCharged(ctx.itinerary).length;
  if (!validateThreeContinentOrigin(ctx.itinerary, chargedCount)) {
    const origin = ctx.itinerary.points[0]!;
    return [
      ruleError(
        "R3015-0-three-continent-origin",
        `3-continent Explorer may only originate in Asia, Europe/Middle East, or North America (origin: ${origin.continent}).`,
      ),
    ];
  }
  return [];
}
