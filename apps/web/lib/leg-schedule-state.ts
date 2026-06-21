import type {
  AttachedFlight,
  LegScheduleState,
  RouteSegment,
} from "@oneworld-explorer/core";

export function emptyLegScheduleStates(
  legCount: number,
  legTypes: ("flight" | "surface")[],
): LegScheduleState[] {
  return Array.from({ length: legCount }, (_, legIndex) => ({
    legIndex,
    status: legTypes[legIndex] === "surface" ? "surface" : "notSearched",
  }));
}

export function attachedFlightToSegment(
  flight: AttachedFlight,
  base: RouteSegment,
): RouteSegment {
  return {
    ...base,
    marketingCarrier: flight.marketingCarrier,
    operatingCarrier: flight.operatingCarrier,
    operatingCarrierSource: flight.operatingCarrierSource,
    flightNumber: flight.flightNumber,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    rbd: flight.rbd,
    bookingClass: flight.bookingClass,
    scheduleSource: flight.provider,
  };
}

export function mergeSegmentsWithSchedule(
  segments: RouteSegment[],
  states: LegScheduleState[],
): RouteSegment[] {
  return segments.map((seg, i) => {
    const state = states[i];
    if (state?.status === "attached" && state.attachedFlight) {
      return attachedFlightToSegment(state.attachedFlight, seg);
    }
    return seg;
  });
}

export function allFlightLegsAttached(
  states: LegScheduleState[],
  legTypes: ("flight" | "surface")[],
): boolean {
  return states.every(
    (s, i) => legTypes[i] === "surface" || s.status === "attached",
  );
}

export function defaultSearchDate(legIndex: number): string {
  const d = new Date();
  d.setDate(d.getDate() + 30 + legIndex * 3);
  return d.toISOString().slice(0, 10);
}
