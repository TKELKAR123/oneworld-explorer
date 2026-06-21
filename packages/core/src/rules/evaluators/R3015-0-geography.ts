import type { EvaluationContext } from "../../ontology/types.js";
import {
  validateAsiaCountries,
  validateContinentDefinition,
  validateEuMeZones,
  validateNaIncludes,
  validateTcDefinition,
} from "../helpers/geography-ontology.js";

function flattenIssues(
  ruleId: string,
  issues: ReturnType<typeof validateTcDefinition>,
) {
  return issues.map((i) => ({ ...i, code: ruleId }));
}

export function evaluateR3015_0_tc_def(ctx: EvaluationContext) {
  return flattenIssues("R3015-0-tc-def", validateTcDefinition(ctx.itinerary.points));
}

export function evaluateR3015_0_continent_def(ctx: EvaluationContext) {
  return flattenIssues(
    "R3015-0-continent-def",
    validateContinentDefinition(ctx.itinerary.points),
  );
}

export function evaluateR3015_0_eu_me_zones(ctx: EvaluationContext) {
  return flattenIssues(
    "R3015-0-eu-me-zones",
    validateEuMeZones(ctx.itinerary.points),
  );
}

export function evaluateR3015_0_asia_countries(ctx: EvaluationContext) {
  return flattenIssues(
    "R3015-0-asia-countries",
    validateAsiaCountries(ctx.itinerary.points),
  );
}

export function evaluateR3015_0_na_includes(ctx: EvaluationContext) {
  return flattenIssues(
    "R3015-0-na-includes",
    validateNaIncludes(ctx.itinerary.points),
  );
}
