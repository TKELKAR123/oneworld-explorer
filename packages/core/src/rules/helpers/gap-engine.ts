import type { ParsedItinerary } from "../../ontology/types.js";
import {
  connectionGapHours,
  isStopoverGap,
  itineraryHasScheduleTimes,
} from "./ticketing.js";
import { isInternationalSegment } from "./international.js";

export function isTransferGap(gapHours: number): boolean {
  return gapHours > 0 && !isStopoverGap(gapHours);
}

/** Connection at pointIndex: gap between previous segment arrival and next departure */
export function connectionGapAtPoint(
  itinerary: ParsedItinerary,
  pointIndex: number,
): number | null {
  if (pointIndex <= 0 || pointIndex >= itinerary.points.length - 1) return null;
  const prevSeg = itinerary.segments[pointIndex - 1];
  const nextSeg = itinerary.segments[pointIndex];
  if (!prevSeg || !nextSeg || prevSeg.surface || nextSeg.surface) return null;
  const arr = prevSeg.arrivalTime;
  const dep = nextSeg.departureTime;
  if (!arr || !dep) return null;
  return connectionGapHours(arr, dep);
}

export function isTransferAtPoint(
  itinerary: ParsedItinerary,
  pointIndex: number,
): boolean {
  const gap = connectionGapAtPoint(itinerary, pointIndex);
  if (gap === null) return false;
  return isTransferGap(gap);
}

export function isStopoverAtPoint(
  itinerary: ParsedItinerary,
  pointIndex: number,
): boolean {
  const gap = connectionGapAtPoint(itinerary, pointIndex);
  if (gap === null) return false;
  return isStopoverGap(gap);
}

/** All flight segments have departure and arrival times (except last dep-only edge cases) */
export function hasScheduleCompleteItinerary(itinerary: ParsedItinerary): boolean {
  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    if (seg.surface) continue;
    if (!seg.departureTime?.trim()) return false;
    if (!seg.arrivalTime?.trim()) return false;
  }
  return itinerary.segments.some((s) => !s.surface);
}

export function hasPartialScheduleTimes(itinerary: ParsedItinerary): boolean {
  return itineraryHasScheduleTimes(itinerary) && !hasScheduleCompleteItinerary(itinerary);
}

/** Gap-aware §4(f) international transfers at a country point */
export function countInternationalTransfersFrom(
  country: string,
  itinerary: ParsedItinerary,
): number {
  let count = 0;
  for (let i = 1; i < itinerary.points.length - 1; i++) {
    const point = itinerary.points[i]!;
    if (point.country !== country) continue;
    const prev = itinerary.points[i - 1]!;
    const next = itinerary.points[i + 1]!;
    if (
      !isInternationalSegment(prev.country, point.country) ||
      !isInternationalSegment(point.country, next.country)
    ) {
      continue;
    }
    if (hasScheduleCompleteItinerary(itinerary)) {
      if (!isTransferAtPoint(itinerary, i)) continue;
    }
    count++;
  }
  return count;
}

/** US §4(f) exception: two intl departures allowed if one arrival-departure pair is transfer */
export function qualifiesUsaDoubleDepartureException(
  itinerary: ParsedItinerary,
): boolean {
  if (!hasScheduleCompleteItinerary(itinerary)) return false;
  for (let i = 1; i < itinerary.points.length - 1; i++) {
    const point = itinerary.points[i]!;
    if (point.country !== "US") continue;
    if (isTransferAtPoint(itinerary, i)) return true;
  }
  return false;
}
