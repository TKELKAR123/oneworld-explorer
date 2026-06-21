import { EXPLORER_RULES } from "../constants.js";
import { continentsCharged } from "../helpers/pricing.js";
import type { EvaluationContext } from "../../ontology/types.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_0_continent_count(ctx: EvaluationContext) {
  const { itinerary } = ctx;
  const charged = continentsCharged(itinerary);
  const chargedCount = charged.length;
  const issues = [];

  if (
    chargedCount < EXPLORER_RULES.minContinents ||
    chargedCount > EXPLORER_RULES.maxContinents
  ) {
    issues.push(
      ruleError(
        "R3015-0-continent-count",
        `Continent count must be 3–6 for Explorer; found ${chargedCount}.`,
        { evidence: charged },
      ),
    );
  }

  return issues;
}
