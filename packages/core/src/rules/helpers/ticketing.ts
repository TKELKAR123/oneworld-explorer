import type { Airport, ParsedItinerary, TicketContext } from "../../ontology/types.js";
import { isInternationalSegment } from "./international.js";

const MS_HOUR = 3_600_000;
const MS_DAY = 86_400_000;

export function parseDateTime(iso: string): Date {
  return new Date(iso);
}

export function connectionGapHours(arrivalIso: string, departureIso: string): number {
  return (
    (parseDateTime(departureIso).getTime() - parseDateTime(arrivalIso).getTime()) /
    MS_HOUR
  );
}

export function isStopoverGap(gapHours: number): boolean {
  return gapHours > 24;
}

export function countStopovers(itinerary: ParsedItinerary): {
  total: number;
  inOriginContinent: number;
} {
  const originContinent = itinerary.points[0]!.continent;
  let total = 0;
  let inOriginContinent = 0;

  for (let i = 0; i < itinerary.segments.length - 1; i++) {
    const seg = itinerary.segments[i]!;
    const next = itinerary.segments[i + 1]!;
    if (seg.surface || next.surface) continue;

    const arr = seg.arrivalTime;
    const dep = next.departureTime;
    if (!arr || !dep) continue;

    const gap = connectionGapHours(arr, dep);
    if (!isStopoverGap(gap)) continue;

    total++;
    const point = itinerary.points[i + 1]!;
    if (point.continent === originContinent) inOriginContinent++;
  }

  return { total, inOriginContinent };
}

export function itineraryHasScheduleTimes(itinerary: ParsedItinerary): boolean {
  return itinerary.segments.some(
    (s) => Boolean(s.departureTime?.trim() || s.arrivalTime?.trim()),
  );
}

export function hasSegmentTimes(itinerary: ParsedItinerary): boolean {
  return itineraryHasScheduleTimes(itinerary);
}

export function hasFullScheduleForStayRules(itinerary: ParsedItinerary): boolean {
  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    if (seg.surface) continue;
    if (!seg.departureTime?.trim()) return false;
    if (i > 0 && !itinerary.segments[i - 1]?.arrivalTime?.trim()) return false;
  }
  return itinerary.segments.some((s) => !s.surface);
}

function flightSegmentIndices(itinerary: ParsedItinerary): number[] {
  const indices: number[] = [];
  for (let i = 0; i < itinerary.segments.length; i++) {
    if (!itinerary.segments[i]!.surface) indices.push(i);
  }
  return indices;
}

export function firstInternationalSegmentIndex(itinerary: ParsedItinerary): number | null {
  const originCountry = itinerary.points[0]!.country;
  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    if (seg.surface) continue;
    const from = itinerary.points[i]!;
    const to = itinerary.points[i + 1]!;
    if (isInternationalSegment(originCountry, from.country) ||
        isInternationalSegment(from.country, to.country)) {
      return i;
    }
  }
  return null;
}

export function lastInternationalSegmentIndex(itinerary: ParsedItinerary): number | null {
  const originCountry = itinerary.points[0]!.country;
  let last: number | null = null;
  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    if (seg.surface) continue;
    const from = itinerary.points[i]!;
    const to = itinerary.points[i + 1]!;
    if (isInternationalSegment(from.country, to.country)) last = i;
    if (isInternationalSegment(to.country, originCountry)) last = i;
  }
  return last;
}

export function segmentDepartureTime(
  itinerary: ParsedItinerary,
  index: number,
): string | null {
  return itinerary.segments[index]?.departureTime?.trim() ?? null;
}

export function completeTicketingDeadline(
  reservationDate: Date,
  departureDate: Date,
): Date {
  const daysBefore = Math.floor(
    (departureDate.getTime() - reservationDate.getTime()) / MS_DAY,
  );
  if (daysBefore >= 29) {
    return new Date(departureDate.getTime() - 25 * MS_DAY);
  }
  if (daysBefore >= 8) {
    const threeDaysAfter = new Date(reservationDate.getTime() + 3 * MS_DAY);
    const sevenBefore = new Date(departureDate.getTime() - 7 * MS_DAY);
    return threeDaysAfter <= sevenBefore ? threeDaysAfter : sevenBefore;
  }
  return new Date(reservationDate.getTime() + 24 * MS_HOUR);
}

export function hasTicketContext(ticket?: TicketContext): boolean {
  if (!ticket) return false;
  return Object.values(ticket).some((v) => v !== undefined && v !== null);
}

export function lastStopoverDepartureTime(itinerary: ParsedItinerary): string | null {
  let lastStopoverIndex: number | null = null;
  for (let i = 0; i < itinerary.segments.length - 1; i++) {
    const seg = itinerary.segments[i]!;
    const next = itinerary.segments[i + 1]!;
    if (seg.surface || next.surface) continue;
    const arr = seg.arrivalTime;
    const dep = next.departureTime;
    if (!arr || !dep) continue;
    if (isStopoverGap(connectionGapHours(arr, dep))) lastStopoverIndex = i + 1;
  }
  if (lastStopoverIndex !== null) {
    return segmentDepartureTime(itinerary, lastStopoverIndex);
  }
  const flightIdx = flightSegmentIndices(itinerary);
  const lastIdx = flightIdx[flightIdx.length - 1];
  return lastIdx !== undefined ? segmentDepartureTime(itinerary, lastIdx) : null;
}

export function originDepartureTime(itinerary: ParsedItinerary): string | null {
  return segmentDepartureTime(itinerary, 0);
}

export function pointAt(itinerary: ParsedItinerary, index: number): Airport {
  return itinerary.points[index]!;
}
