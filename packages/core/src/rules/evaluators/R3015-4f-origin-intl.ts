import type { EvaluationContext } from "../../ontology/types.js";
import {
  intlArrivalsTo,
  intlDeparturesFrom,
  intlTransfersFrom,
  isInternationalSegment,
} from "../helpers/international.js";
import {
  hasScheduleCompleteItinerary,
  qualifiesUsaDoubleDepartureException,
} from "../helpers/gap-engine.js";
import { ruleError, ruleWarning } from "./utils.js";

export function evaluateR3015_4f_origin_intl(ctx: EvaluationContext) {
  const origin = ctx.itinerary.points[0]!;
  const originCountry = origin.country;
  const maxIntl = originCountry === "US" ? 2 : 1;
  const depIntl = intlDeparturesFrom(originCountry, ctx.itinerary);
  const arrIntl = intlArrivalsTo(originCountry, ctx.itinerary);
  const transfers = intlTransfersFrom(originCountry, ctx.itinerary);
  const issues = [];

  if (depIntl > maxIntl) {
    issues.push(
      ruleError(
        "R3015-4f-origin-intl",
        `At most ${maxIntl} international departure(s) from origin country ${originCountry}; found ${depIntl}.`,
      ),
    );
  }
  if (arrIntl > maxIntl) {
    issues.push(
      ruleError(
        "R3015-4f-origin-intl",
        `At most ${maxIntl} international arrival(s) to origin country ${originCountry}; found ${arrIntl}.`,
      ),
    );
  }
  if (transfers > 4) {
    issues.push(
      ruleError(
        "R3015-4f-origin-intl",
        `At most 4 international transfers from origin country; found ${transfers}.`,
      ),
    );
  }
  return issues;
}

export function evaluateR3015_4f_usa_exception(ctx: EvaluationContext) {
  const origin = ctx.itinerary.points[0]!;
  if (origin.country !== "US") return [];

  const depIntl = intlDeparturesFrom("US", ctx.itinerary);
  if (depIntl !== 2) return [];

  if (hasScheduleCompleteItinerary(ctx.itinerary)) {
    if (qualifiesUsaDoubleDepartureException(ctx.itinerary)) return [];
    return [
      ruleError(
        "R3015-4f-usa-exception",
        "Two US international departures require one arrival–departure pair to be a transfer without stopover (≤24h) per §4(f) EXCEPTION.",
      ),
    ];
  }

  return [
    ruleWarning(
      "R3015-4f-usa-exception",
      "Two US international departures require one arrival–departure pair to be a transfer without stopover — attach flight times for a definitive check.",
    ),
  ];
}

export function evaluateR3015_4f_us_ca_domestic(ctx: EvaluationContext) {
  const issues = [];
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const from = ctx.itinerary.points[i]!;
    const to = ctx.itinerary.points[i + 1]!;
    const pair = new Set([from.country, to.country]);
    if (pair.has("US") && pair.has("CA")) {
      if (isInternationalSegment(from.country, to.country)) {
        issues.push(
          ruleError(
            "R3015-4f-us-ca-domestic",
            `US–Canada segment ${from.iata}→${to.iata} must not count as international.`,
          ),
        );
      }
    }
  }
  return issues;
}
