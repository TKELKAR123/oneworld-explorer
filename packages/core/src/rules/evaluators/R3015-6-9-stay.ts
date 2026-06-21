import type { EvaluationContext } from "../../ontology/types.js";
import {
  countStopovers,
  firstInternationalSegmentIndex,
  hasTicketContext,
  itineraryHasScheduleTimes,
  lastInternationalSegmentIndex,
  lastStopoverDepartureTime,
  originDepartureTime,
  parseDateTime,
  segmentDepartureTime,
} from "../helpers/ticketing.js";
import {
  countDeclaredStopovers,
  hasDeclaredStopIntents,
} from "../helpers/stop-intent.js";
import {
  isEligibleCarrier,
  isPermittedFlightSegment,
  itineraryHasCarrierData,
  resolveOperatingCarrier,
} from "../helpers/carriers.js";
import { ruleError, ruleWarning } from "./utils.js";

const MS_DAY = 86_400_000;
const MS_MONTH = MS_DAY * 30.4375;

export function evaluateR3015_6_min_stay(ctx: EvaluationContext) {
  if (!itineraryHasScheduleTimes(ctx.itinerary)) return [];

  const originZone = ctx.itinerary.points[0]!.zone;
  if (originZone !== "TC1") return [];

  const firstIdx = firstInternationalSegmentIndex(ctx.itinerary);
  const lastIdx = lastInternationalSegmentIndex(ctx.itinerary);
  if (firstIdx === null || lastIdx === null) return [];

  const firstDep = segmentDepartureTime(ctx.itinerary, firstIdx);
  const lastDep = segmentDepartureTime(ctx.itinerary, lastIdx);
  if (!firstDep || !lastDep) return [];

  const gapDays =
    (parseDateTime(lastDep).getTime() - parseDateTime(firstDep).getTime()) /
    MS_DAY;
  if (gapDays < 10) {
    return [
      ruleError(
        "R3015-6-min-stay",
        `TC1 origin requires last international sector at least 10 days after first (${gapDays.toFixed(1)} days) per §6.`,
      ),
    ];
  }
  return [];
}

export function evaluateR3015_7_max_stay(ctx: EvaluationContext) {
  if (!itineraryHasScheduleTimes(ctx.itinerary)) return [];

  const originDep = originDepartureTime(ctx.itinerary);
  const lastDep = lastStopoverDepartureTime(ctx.itinerary);
  if (!originDep || !lastDep) return [];

  const gapMonths =
    (parseDateTime(lastDep).getTime() - parseDateTime(originDep).getTime()) /
    MS_MONTH;
  if (gapMonths > 12) {
    return [
      ruleError(
        "R3015-7-max-stay",
        `Return from last stopover must commence within 12 months of origin departure (${gapMonths.toFixed(1)} months) per §7.`,
      ),
    ];
  }
  return [];
}

export function evaluateR3015_8_stopovers(ctx: EvaluationContext) {
  if (itineraryHasScheduleTimes(ctx.itinerary)) {
    const { total, inOriginContinent } = countStopovers(ctx.itinerary);
    const issues = [];

    if (total < 2) {
      issues.push(
        ruleError(
          "R3015-8-stopovers",
          `Minimum 2 stopovers required; detected ${total} per §8.`,
        ),
      );
    }
    if (inOriginContinent > 2) {
      issues.push(
        ruleError(
          "R3015-8-stopovers",
          `Maximum 2 stopovers in continent of origin; detected ${inOriginContinent} per §8.`,
        ),
      );
    }
    return issues;
  }

  if (!hasDeclaredStopIntents(ctx.options.stopIntents)) return [];

  const { total, inOriginContinent } = countDeclaredStopovers(
    ctx.itinerary,
    ctx.options.stopIntents,
  );
  const issues = [];

  if (total < 2) {
    issues.push(
      ruleWarning(
        "R3015-8-stopovers",
        `Self-declared: minimum 2 stopovers required; you marked ${total}. Confirm with flight times per §8.`,
        { category: "self-declared" },
      ),
    );
  }
  if (inOriginContinent > 2) {
    issues.push(
      ruleWarning(
        "R3015-8-stopovers",
        `Self-declared: maximum 2 stopovers in continent of origin; you marked ${inOriginContinent} per §8.`,
        { category: "self-declared" },
      ),
    );
  }
  return issues;
}

export function evaluateR3015_9_transfers(ctx: EvaluationContext) {
  if (!itineraryHasCarrierData(ctx.itinerary.segments)) return [];

  const issues = [];
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.surface) continue;
    const op = resolveOperatingCarrier(seg);
    if (op && !isEligibleCarrier(op) && !isPermittedFlightSegment(seg)) {
      issues.push(
        ruleError(
          "R3015-9-transfers",
          `Transfer segment ${i + 1} uses ineligible carrier ${op} (§9).`,
          { segmentIndex: i },
        ),
      );
    }
  }
  return issues;
}
