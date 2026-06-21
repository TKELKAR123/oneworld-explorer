import type {
  LegScheduleState,
  ParsedItinerary,
  RouteSegment,
  ScheduleValidationSummary,
  ValidationMode,
} from "./ontology/types.js";
import {
  hasPartialScheduleTimes,
  hasScheduleCompleteItinerary,
} from "./rules/helpers/gap-engine.js";

export function inferScheduleMode(
  itinerary: ParsedItinerary,
  validationMode?: ValidationMode,
  legScheduleStates?: LegScheduleState[],
): ScheduleValidationSummary["mode"] {
  if (validationMode === "scheduleComplete") return "scheduleComplete";
  if (validationMode === "geometry") return "geometry";
  if (legScheduleStates?.every((l) => l.status === "attached" || l.status === "surface")) {
    const flightLegs = legScheduleStates.filter((l) => l.status !== "surface");
    if (flightLegs.length > 0 && flightLegs.every((l) => l.status === "attached")) {
      return "scheduleComplete";
    }
  }
  if (hasScheduleCompleteItinerary(itinerary)) return "scheduleComplete";
  if (hasPartialScheduleTimes(itinerary)) return "partialSchedule";
  return "geometry";
}

export function buildScheduleSummary(
  itinerary: ParsedItinerary,
  options: {
    validationMode?: ValidationMode;
    legScheduleStates?: LegScheduleState[];
    legTypes?: ("flight" | "surface")[];
  } = {},
): ScheduleValidationSummary {
  const mode = inferScheduleMode(
    itinerary,
    options.validationMode,
    options.legScheduleStates,
  );
  const missing: string[] = [];
  const legs: LegScheduleState[] =
    options.legScheduleStates ??
    itinerary.segments.map((seg: RouteSegment, legIndex: number) => ({
      legIndex,
      status: seg.surface
        ? "surface"
        : hasScheduleCompleteItinerary({
            segments: [seg],
            points: [itinerary.points[legIndex]!, itinerary.points[legIndex + 1]!],
          })
          ? "attached"
          : seg.departureTime || seg.marketingCarrier
            ? "partial"
            : "notSearched",
    }));

  if (mode !== "scheduleComplete") {
    if (!hasScheduleCompleteItinerary(itinerary)) {
      missing.push("Attach flights with departure and arrival times for stopover and stay rules");
    }
  }

  return {
    mode,
    legs,
    bookingRulesActive: mode === "scheduleComplete",
    missingForBookingRules: missing.length ? missing : undefined,
  };
}

export function segmentsFromLegScheduleStates(
  segments: RouteSegment[],
  legScheduleStates?: LegScheduleState[],
): RouteSegment[] {
  if (!legScheduleStates?.length) return segments;
  return segments.map((seg, i) => {
    const state = legScheduleStates[i];
    const flight = state?.attachedFlight;
    if (!flight || state.status !== "attached") return seg;
    return {
      ...seg,
      marketingCarrier: flight.marketingCarrier,
      operatingCarrier: flight.operatingCarrier,
      operatingCarrierSource: flight.operatingCarrierSource,
      flightNumber: flight.flightNumber,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      rbd: flight.rbd ?? seg.rbd,
      bookingClass: flight.bookingClass ?? seg.bookingClass,
      scheduleSource: flight.provider,
    };
  });
}
