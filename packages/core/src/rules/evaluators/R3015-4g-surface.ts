import type { EvaluationContext } from "../../ontology/types.js";
import {
  segmentCrossesAtlantic,
  segmentCrossesPacific,
} from "../helpers/geometry.js";
import { ruleError } from "./utils.js";

function countTransoceanicSurface(ctx: EvaluationContext): number {
  return ctx.itinerary.segments.filter((seg, i) => {
    if (!seg.surface) return false;
    const from = ctx.itinerary.points[i]!;
    const to = ctx.itinerary.points[i + 1]!;
    return segmentCrossesAtlantic(from, to) || segmentCrossesPacific(from, to);
  }).length;
}

export function evaluateR3015_4g_surface(ctx: EvaluationContext) {
  const origin = ctx.itinerary.points[0]!;
  const swpOrigin = origin.continent === "south-west-pacific";
  const count = countTransoceanicSurface(ctx);

  if (!swpOrigin && count > 0) {
    return [
      ruleError(
        "R3015-4g-surface",
        `Transoceanic surface sectors are not permitted; found ${count}.`,
      ),
    ];
  }
  return [];
}

export function evaluateR3015_4g_swp_transoceanic(ctx: EvaluationContext) {
  const origin = ctx.itinerary.points[0]!;
  if (origin.continent !== "south-west-pacific") return [];

  const count = countTransoceanicSurface(ctx);
  if (count > 1) {
    return [
      ruleError(
        "R3015-4g-swp-transoceanic",
        `At most one transoceanic surface sector permitted for SWP origin; found ${count}.`,
      ),
    ];
  }
  return [];
}
