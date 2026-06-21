import type { EvaluationContext } from "../../ontology/types.js";
import {
  completeTicketingDeadline,
  firstInternationalSegmentIndex,
  hasTicketContext,
  parseDateTime,
  segmentDepartureTime,
} from "../helpers/ticketing.js";
import { isAllowedRbd } from "../helpers/booking-classes.js";
import {
  resolveMarketingCarrier,
  segmentHasCarrierData,
} from "../helpers/carriers.js";
import { ruleError } from "./utils.js";

export function evaluateR3015_5_reservations(ctx: EvaluationContext) {
  const ticket = ctx.ticket ?? ctx.options.ticket;
  if (!hasTicketContext(ticket)) return [];

  const issues = [];
  if (ticket!.pnrHasOsiRtw === false) {
    issues.push(
      ruleError(
        "R3015-5-reservations",
        "PNR must include OSI YY OW RTW per §5(a).",
      ),
    );
  }

  const firstIntl = firstInternationalSegmentIndex(ctx.itinerary);
  if (
    firstIntl !== null &&
    ticket!.reservationDate &&
    ticket!.ticketingCompleteDate
  ) {
    const depIso = segmentDepartureTime(ctx.itinerary, firstIntl);
    if (depIso) {
      const deadline = completeTicketingDeadline(
        parseDateTime(ticket!.reservationDate),
        parseDateTime(depIso),
      );
      const completed = parseDateTime(ticket!.ticketingCompleteDate);
      if (completed > deadline) {
        issues.push(
          ruleError(
            "R3015-5-reservations",
            `Complete ticketing by ${deadline.toISOString()} required; completed ${completed.toISOString()} (§5(a)).`,
          ),
        );
      }
    }
  }

  return issues;
}

export function evaluateR3015_5b_booking(ctx: EvaluationContext) {
  const travelClass = ctx.options.travelClass ?? "economy";
  const issues = [];

  for (let i = 0; i < ctx.itinerary.segments.length; i++) {
    const seg = ctx.itinerary.segments[i]!;
    if (seg.surface || !seg.rbd?.trim()) continue;

    const carrier = resolveMarketingCarrier(seg);
    if (!carrier) continue;

    const from = ctx.itinerary.points[i]!;
    const to = ctx.itinerary.points[i + 1]!;
    const isDomestic = from.country === to.country;

    if (!isAllowedRbd(carrier, travelClass, seg.rbd, isDomestic)) {
      issues.push(
        ruleError(
          "R3015-5b-booking",
          `RBD ${seg.rbd.toUpperCase()} on segment ${i + 1} (${carrier}) is not permitted for ${travelClass} per §5(b).`,
          { segmentIndex: i },
        ),
      );
    }
  }

  return issues;
}
