import type { Continent } from "../../ontology/types.js";
import type { EvaluationContext } from "../../ontology/types.js";
import { continentsCharged, swpEuViaAsiaPattern } from "../helpers/pricing.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_0_fare_basis(ctx: EvaluationContext) {
  const { analysis } = ctx;
  const chargedCount = continentsCharged(ctx.itinerary).length;

  if (analysis.suggestedFareBasis === null && chargedCount >= 3) {
    return [
      ruleError(
        "R3015-0-fare-basis",
        `No fare basis for ${chargedCount} continents and class ${ctx.options.travelClass ?? "economy"}.`,
      ),
    ];
  }
  return [];
}

export function evaluateR3015_0_swp_eu_via_asia(ctx: EvaluationContext) {
  const { itinerary, analysis } = ctx;
  if (!swpEuViaAsiaPattern(itinerary)) return [];

  const charged = analysis?.continentsVisited ?? continentsCharged(itinerary);
  const chargedCount = analysis?.continentCount ?? charged.length;
  const issues = [];
  const required: Continent[] = ["south-west-pacific", "asia", "europe-middle-east"];

  for (const c of required) {
    if (!charged.includes(c)) {
      issues.push(
        ruleError(
          "R3015-0-swp-eu-via-asia",
          `SWP↔Europe/Middle East via Asia pattern requires ${c} to be counted.`,
        ),
      );
    }
  }
  if (chargedCount < 3) {
    issues.push(
      ruleError(
        "R3015-0-swp-eu-via-asia",
        "SWP↔Europe/Middle East pattern requires at least 3 continents charged.",
      ),
    );
  }
  return issues;
}
