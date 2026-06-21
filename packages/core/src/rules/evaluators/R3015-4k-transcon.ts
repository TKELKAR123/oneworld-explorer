import type { EvaluationContext } from "../../ontology/types.js";
import {
  AU_RESTRICTED_PAIRS,
} from "../constants.js";
import { isNaTransconPair } from "../helpers/transcon.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_4k_us_transcon(ctx: EvaluationContext) {
  const { itinerary } = ctx;
  let transconCount = 0;

  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    if (seg.surface) continue;
    const from = itinerary.points[i]!;
    const to = itinerary.points[i + 1]!;
    if (isNaTransconPair(from, to)) transconCount++;
  }

  if (transconCount > 1) {
    return [
      ruleError(
        "R3015-4k-us-transcon",
        `At most one US/Canada transcontinental flight permitted; found ${transconCount}.`,
      ),
    ];
  }
  return [];
}

export function evaluateR3015_4k_alaska(ctx: EvaluationContext) {
  const { itinerary } = ctx;
  let alaskaArr = 0;
  let alaskaDep = 0;

  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    if (seg.surface) continue;
    const from = itinerary.points[i]!;
    const to = itinerary.points[i + 1]!;
    const na = new Set([from.country, to.country]);
    if (!na.has("US") && !na.has("CA")) continue;
    if (to.usState === "AK") alaskaArr++;
    if (from.usState === "AK") alaskaDep++;
  }

  if (alaskaArr > 1 || alaskaDep > 1) {
    return [
      ruleError(
        "R3015-4k-alaska",
        `At most one flight to Alaska and one from Alaska permitted (found ${alaskaArr} arrivals, ${alaskaDep} departures).`,
      ),
    ];
  }
  return [];
}

export function evaluateR3015_4l_australia(ctx: EvaluationContext) {
  const { itinerary } = ctx;
  const issues = [];

  for (const [hub, metros] of AU_RESTRICTED_PAIRS) {
    let count = 0;
    for (let i = 0; i < itinerary.segments.length; i++) {
      const seg = itinerary.segments[i]!;
      if (seg.surface) continue;
      const from = itinerary.points[i]!;
      const to = itinerary.points[i + 1]!;
      if (from.country !== "AU" || to.country !== "AU") continue;
      const pair = new Set([from.iata, to.iata]);
      if (pair.has(hub) && metros.some((m) => pair.has(m))) count++;
    }
    if (count > 1) {
      issues.push(
        ruleError(
          "R3015-4l-australia",
          `At most one nonstop flight between ${hub} and listed Australian metros; found ${count}.`,
        ),
      );
    }
  }
  return issues;
}
