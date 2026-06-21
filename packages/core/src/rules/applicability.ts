import type {
  EvaluationContext,
  RuleEvaluation,
  RuleEvaluationApplicability,
} from "../ontology/types.js";
import { AU_RESTRICTED_PAIRS } from "./constants.js";
import { detectOpenJawType } from "./helpers/open-jaw.js";
import { isNaTransconPair } from "./helpers/transcon.js";
import { itineraryHasScheduleTimes } from "./helpers/ticketing.js";
import { hasDeclaredStopIntents } from "./helpers/stop-intent.js";
import { itineraryHasCarrierData } from "./helpers/carriers.js";
import { getRuleDisplayMeta } from "./rule-metadata.js";

function hasMarketingCarrier(ctx: EvaluationContext): boolean {
  return ctx.itinerary.segments.some(
    (s) => !s.surface && Boolean(s.marketingCarrier?.trim()),
  );
}

function hasCarrierData(ctx: EvaluationContext): boolean {
  return itineraryHasCarrierData(ctx.itinerary.segments);
}

function hasCodeshareData(ctx: EvaluationContext): boolean {
  return ctx.itinerary.segments.some((s) => {
    if (s.surface) return false;
    const mk = s.marketingCarrier?.trim();
    const op = s.operatingCarrier?.trim();
    return Boolean(mk && op && mk.toUpperCase() !== op.toUpperCase());
  });
}

function hasAffiliateOperator(ctx: EvaluationContext): boolean {
  return ctx.itinerary.segments.some((s) => {
    if (s.surface) return false;
    const op = s.operatingCarrier?.trim().toUpperCase();
    return Boolean(
      op &&
        ["QX", "OO", "MQ", "PT", "OH", "YX", "CJ", "A0", "JC", "N7", "YW", "I2", "JLJ", "QQ", "ATR"].includes(
          op,
        ),
    );
  });
}

function hasGroundTransport(ctx: EvaluationContext): boolean {
  return ctx.itinerary.segments.some((s) => s.groundTransport);
}

function hasRbdData(ctx: EvaluationContext): boolean {
  return ctx.itinerary.segments.some((s) => !s.surface && Boolean(s.rbd?.trim()));
}

function hasTicketContext(ctx: EvaluationContext): boolean {
  return Boolean(ctx.ticket && Object.keys(ctx.ticket).length > 0);
}

function hasPurchaseData(ctx: EvaluationContext): boolean {
  return ctx.ticket?.purchasedBeforeDeparture !== undefined;
}

function hasStockData(ctx: EvaluationContext): boolean {
  return Boolean(ctx.ticket?.validatingCarrier?.trim());
}

function hasReservationData(ctx: EvaluationContext): boolean {
  const t = ctx.ticket;
  return Boolean(
    t &&
      (t.reservationDate ||
        t.ticketingCompleteDate ||
        t.pnrHasOsiRtw !== undefined),
  );
}

function hasIone3Context(ctx: EvaluationContext): boolean {
  return (
    ctx.analysis.suggestedFareBasis === "IONE3" &&
    Boolean(ctx.ticket?.saleMarket?.trim())
  );
}

function hasCubaItinerary(ctx: EvaluationContext): boolean {
  return ctx.itinerary.points.some((p) => p.country === "CU");
}

function hasJqQfSegment(ctx: EvaluationContext): boolean {
  return ctx.itinerary.segments.some((seg) => {
    if (seg.surface) return false;
    return (
      seg.marketingCarrier?.trim().toUpperCase() === "QF" &&
      seg.operatingCarrier?.trim().toUpperCase() === "JQ"
    );
  });
}

function touchesAlaska(ctx: EvaluationContext): boolean {
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.surface) continue;
    const from = ctx.itinerary.points[i]!;
    const to = ctx.itinerary.points[i + 1]!;
    if (from.usState === "AK" || to.usState === "AK") return true;
  }
  return false;
}

function touchesHawaii(ctx: EvaluationContext): boolean {
  return ctx.itinerary.points.some((p) => p.usState === "HI");
}

function touchesAustraliaRestrictedPair(ctx: EvaluationContext): boolean {
  for (const [hub, metros] of AU_RESTRICTED_PAIRS) {
    for (let i = 0; i < ctx.itinerary.segments.length; i++) {
      const seg = ctx.itinerary.segments[i]!;
      if (seg.surface) continue;
      const from = ctx.itinerary.points[i]!;
      const to = ctx.itinerary.points[i + 1]!;
      if (from.country !== "AU" || to.country !== "AU") continue;
      const pair = new Set([from.iata, to.iata]);
      if (pair.has(hub) && metros.some((m) => pair.has(m))) return true;
    }
  }
  return false;
}

function touchesUsTranscon(ctx: EvaluationContext): boolean {
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.surface) continue;
    const from = ctx.itinerary.points[i]!;
    const to = ctx.itinerary.points[i + 1]!;
    if (isNaTransconPair(from, to)) return true;
  }
  return false;
}

function openJawTriggered(ctx: EvaluationContext): boolean {
  const origin = ctx.itinerary.points[0]!;
  const termination = ctx.itinerary.points[ctx.itinerary.points.length - 1]!;
  return origin.iata !== termination.iata;
}

function isRuleTriggered(ruleId: string, ctx: EvaluationContext): boolean {
  const origin = ctx.itinerary.points[0]!;
  const termination = ctx.itinerary.points[ctx.itinerary.points.length - 1]!;

  if (ruleId.startsWith("R3015-4c-open-jaw-")) {
    if (!openJawTriggered(ctx)) return false;
    const jawType = detectOpenJawType(ctx.itinerary);
    const suffix = ruleId.replace("R3015-4c-open-jaw-", "");
    const map: Record<string, string> = {
      a: "within-origin-country",
      b: "within-middle-east",
      c: "us-canada",
      d: "hkg-china",
      e: "my-sin",
      f: "within-africa",
      g: "mv-lk-in",
    };
    const expected = map[suffix];
    if (jawType === null) return false;
    return jawType === expected;
  }

  switch (ruleId) {
    case "R3015-4b-hawaii":
      return touchesHawaii(ctx);
    case "R3015-4g-swp-transoceanic":
      return origin.continent === "south-west-pacific";
    case "R3015-4k-alaska":
      return touchesAlaska(ctx);
    case "R3015-4k-us-transcon":
      return touchesUsTranscon(ctx);
    case "R3015-4l-australia":
      return touchesAustraliaRestrictedPair(ctx);
    case "R3015-4-carriers-warn":
      return hasMarketingCarrier(ctx);
    case "R3015-4-carriers":
      return hasCarrierData(ctx);
    case "R3015-4j-codeshare":
      return hasCodeshareData(ctx);
    case "R3015-4j-jq-qq":
      return ctx.itinerary.segments.some((seg) => {
        if (seg.surface) return false;
        const mk = seg.marketingCarrier?.trim().toUpperCase();
        const op = seg.operatingCarrier?.trim().toUpperCase();
        return mk === "QF" && (op === "JQ" || op === "QQ");
      });
    case "R3015-4-affiliates":
      return hasAffiliateOperator(ctx);
    case "R3015-4-no-ground-transport":
      return hasGroundTransport(ctx);
    case "R3015-0-purchase":
      return hasPurchaseData(ctx);
    case "R3015-0-IONE3-markets":
      return hasIone3Context(ctx);
    case "R3015-5-reservations":
      return hasReservationData(ctx);
    case "R3015-5b-booking":
      return hasRbdData(ctx);
    case "R3015-6-min-stay":
    case "R3015-7-max-stay":
    case "R3015-8-stopovers":
      return (
        itineraryHasScheduleTimes(ctx.itinerary) ||
        hasDeclaredStopIntents(ctx.options.stopIntents)
      );
    case "R3015-9-transfers":
      return itineraryHasScheduleTimes(ctx.itinerary) &&
        itineraryHasCarrierData(ctx.itinerary.segments);
    case "R3015-15-stock":
      return hasStockData(ctx);
    case "R3015-15-stock-jq":
      return hasJqQfSegment(ctx) && hasStockData(ctx);
    case "R3015-15-cuba":
      return hasCubaItinerary(ctx) && hasCarrierData(ctx);
    default:
      return true;
  }
}

export function resolveApplicability(
  ruleId: string,
  ctx: EvaluationContext,
  passed: boolean,
): RuleEvaluationApplicability {
  const meta = getRuleDisplayMeta(ruleId);
  if (meta.applicability === "always") return "active";
  if (!isRuleTriggered(ruleId, ctx)) return "notApplicable";
  if (passed) return "active";
  return "active";
}

export function enrichRuleEvaluation(
  evaluation: RuleEvaluation,
  ctx: EvaluationContext,
): RuleEvaluation {
  const meta = getRuleDisplayMeta(evaluation.ruleId);
  const applicability = resolveApplicability(
    evaluation.ruleId,
    ctx,
    evaluation.passed,
  );
  return {
    ...evaluation,
    ruleKind: meta.ruleKind,
    displayGroup: meta.displayGroup,
    applicability,
  };
}
