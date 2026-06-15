import type { ParsedItinerary } from "../../ontology/types.js";

export function isInternationalSegment(
  fromCountry: string,
  toCountry: string,
): boolean {
  if (fromCountry === toCountry) return false;
  const pair = new Set([fromCountry, toCountry]);
  if (pair.has("US") && pair.has("CA")) return false;
  return true;
}

export function intlDeparturesFrom(
  country: string,
  itinerary: ParsedItinerary,
): number {
  let count = 0;
  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    if (seg.surface) continue;
    const from = itinerary.points[i]!;
    const to = itinerary.points[i + 1]!;
    if (from.country === country && isInternationalSegment(from.country, to.country)) {
      count++;
    }
  }
  return count;
}

export function intlArrivalsTo(
  country: string,
  itinerary: ParsedItinerary,
): number {
  let count = 0;
  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    if (seg.surface) continue;
    const from = itinerary.points[i]!;
    const to = itinerary.points[i + 1]!;
    if (to.country === country && isInternationalSegment(from.country, to.country)) {
      count++;
    }
  }
  return count;
}

export function intlTransfersFrom(
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
      isInternationalSegment(prev.country, point.country) &&
      isInternationalSegment(point.country, next.country)
    ) {
      count++;
    }
  }
  return count;
}
