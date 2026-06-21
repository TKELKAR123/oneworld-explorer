import type { EvaluationContext } from "../../ontology/types.js";
import {
  getAffiliateParent,
  isAffiliateOfEligibleParent,
  isCodeshareException,
  isEligibleCarrier,
  isPermittedCodeshare,
  resolveMarketingCarrier,
  resolveOperatingCarrier,
} from "../helpers/carriers.js";
import { ruleError } from "./utils.js";

function isCodeshareSegment(ctx: EvaluationContext, index: number): boolean {
  const seg = ctx.itinerary.segments[index]!;
  const mkt = resolveMarketingCarrier(seg);
  const op = resolveOperatingCarrier(seg);
  return Boolean(mkt && op && mkt !== op);
}

export function evaluateR3015_4j_codeshare(ctx: EvaluationContext) {
  const issues = [];
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.surface) continue;
    if (!isCodeshareSegment(ctx, i)) continue;

    const mkt = resolveMarketingCarrier(seg)!;
    const op = resolveOperatingCarrier(seg)!;
    if (!isPermittedCodeshare(mkt, op)) {
      issues.push(
        ruleError(
          "R3015-4j-codeshare",
          `Codeshare ${mkt}/${op} on segment ${i + 1} is not permitted under §4(j).`,
          { segmentIndex: i },
        ),
      );
    }
  }
  return issues;
}

export function evaluateR3015_4j_jq_qq(ctx: EvaluationContext) {
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.surface) continue;
    const mkt = resolveMarketingCarrier(seg);
    const op = resolveOperatingCarrier(seg);
    if (mkt === "QF" && (op === "JQ" || op === "QQ")) {
      if (!isCodeshareException(mkt, op)) {
        return [
          ruleError(
            "R3015-4j-jq-qq",
            `QF/${op} codeshare exception is not registered for segment ${i + 1}.`,
            { segmentIndex: i },
          ),
        ];
      }
    }
  }
  return [];
}

export function evaluateR3015_4_affiliates(ctx: EvaluationContext) {
  const issues = [];
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.surface) continue;
    const op = resolveOperatingCarrier(seg);
    if (!op || isEligibleCarrier(op)) continue;

    const mkt = resolveMarketingCarrier(seg) ?? op;
    if (isPermittedCodeshare(mkt, op)) continue;

    if (!isAffiliateOfEligibleParent(op)) {
      issues.push(
        ruleError(
          "R3015-4-affiliates",
          `Operating carrier ${op} on segment ${i + 1} is not a listed affiliate of an eligible Explorer carrier.`,
          { segmentIndex: i },
        ),
      );
    } else {
      const parent = getAffiliateParent(op);
      const mkt = resolveMarketingCarrier(seg);
      if (mkt && parent && mkt !== parent && !isEligibleCarrier(mkt)) {
        issues.push(
          ruleError(
            "R3015-4-affiliates",
            `Affiliate ${op} (${parent}) on segment ${i + 1} requires eligible marketing carrier.`,
            { segmentIndex: i },
          ),
        );
      }
    }
  }
  return issues;
}

export function evaluateR3015_4_no_ground_transport(ctx: EvaluationContext) {
  const issues = [];
  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.groundTransport) {
      issues.push(
        ruleError(
          "R3015-4-no-ground-transport",
          `Segment ${i + 1} uses BA/QF ground transportation, which may not be included in the Explorer (§4).`,
          { segmentIndex: i },
        ),
      );
    }
  }
  return issues;
}
