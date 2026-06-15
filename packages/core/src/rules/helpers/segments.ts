import type { Continent, RouteSegment } from "../../ontology/types.js";
import type { ParsedItinerary } from "../../ontology/types.js";
import { EXPLORER_RULES } from "../constants.js";
import { isIntercontinental } from "./geometry.js";

export function freeFlightSegmentsUsed(
  continent: Continent,
  itinerary: ParsedItinerary,
): number {
  let count = 0;
  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i];
    if (seg.surface) continue;
    const from = itinerary.points[i];
    const to = itinerary.points[i + 1];
    if (!from || !to) continue;
    if (from.continent === continent && to.continent === continent) {
      count++;
    }
  }
  return count;
}

export function continentsVisited(itinerary: ParsedItinerary): Continent[] {
  const set = new Set<Continent>();
  for (const p of itinerary.points) set.add(p.continent);
  return [...set];
}

export function countIntercontinentalEvents(
  itinerary: ParsedItinerary,
): { departures: Map<Continent, number>; arrivals: Map<Continent, number> } {
  const departures = new Map<Continent, number>();
  const arrivals = new Map<Continent, number>();
  for (let i = 0; i < itinerary.segments.length; i++) {
    const from = itinerary.points[i];
    const to = itinerary.points[i + 1];
    if (!from || !to || !isIntercontinental(from, to)) continue;
    departures.set(from.continent, (departures.get(from.continent) ?? 0) + 1);
    arrivals.set(to.continent, (arrivals.get(to.continent) ?? 0) + 1);
  }
  return { departures, arrivals };
}

export function segmentLimit(continent: Continent): number {
  return EXPLORER_RULES.flightSegmentLimits[continent];
}
