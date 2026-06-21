import type { EvaluationContext } from "../../ontology/types.js";
import {
  CUBA_BANNED_OPERATORS,
  hasQfJqSegment,
  resolveOperatingCarrier,
  STOCK_CARRIERS,
  touchesCuba,
} from "../helpers/carriers.js";
import { hasTicketContext } from "../helpers/ticketing.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_15_stock(ctx: EvaluationContext) {
  const ticket = ctx.ticket ?? ctx.options.ticket;
  if (!hasTicketContext(ticket)) return [];

  const vc = ticket!.validatingCarrier?.trim().toUpperCase();
  if (!vc) return [];

  if (!STOCK_CARRIERS.has(vc)) {
    return [
      ruleError(
        "R3015-15-stock",
        `Validating carrier ${vc} is not permitted ticket stock per §15 (NU is travel-eligible but not stock-eligible).`,
      ),
    ];
  }
  return [];
}

export function evaluateR3015_15_stock_jq(ctx: EvaluationContext) {
  const ticket = ctx.ticket ?? ctx.options.ticket;
  if (!hasTicketContext(ticket)) return [];
  if (!hasQfJqSegment(ctx.itinerary.segments)) return [];

  const vc = ticket!.validatingCarrier?.trim().toUpperCase();
  if (!vc) return [];

  if (vc === "IB" || vc === "WY") {
    return [
      ruleError(
        "R3015-15-stock-jq",
        `When JQ-operated QF service is included, ${vc} ticket stock cannot be used (§15 EXCEPTION).`,
      ),
    ];
  }
  return [];
}

export function evaluateR3015_15_cuba(ctx: EvaluationContext) {
  if (!touchesCuba(ctx.itinerary.points)) return [];

  const issues = [];
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.surface) continue;
    const op = resolveOperatingCarrier(seg);
    if (!op) continue;
    if (CUBA_BANNED_OPERATORS.has(op)) {
      issues.push(
        ruleError(
          "R3015-15-cuba",
          `Cuba itinerary may not include ${op}-operated segment ${i + 1} per §15 U.S. restrictions.`,
          { segmentIndex: i },
        ),
      );
    }
  }
  return issues;
}
