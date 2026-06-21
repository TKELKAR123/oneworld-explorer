import type { ItinerarySuggestion, RouteSegment } from "./ontology/types.js";
import { validateSegmentContinuity } from "./build-itinerary.js";

export function suggestItineraryFixes(
  segments: RouteSegment[],
): ItinerarySuggestion[] {
  const suggestions: ItinerarySuggestion[] = [];
  for (let i = 1; i < segments.length; i++) {
    const prev = segments[i - 1]!.to.trim().toUpperCase();
    const curr = segments[i]!.from.trim().toUpperCase();
    if (prev !== curr) {
      suggestions.push({
        kind: "insert_stop",
        from: prev,
        to: curr,
        reason: `Route jumps from ${prev} to ${curr} without a connecting leg.`,
        legIndex: i - 1,
      });
      suggestions.push({
        kind: "mark_surface",
        from: prev,
        to: curr,
        reason: `Mark a surface leg ${prev}→${curr} if travel is overland.`,
        legIndex: i - 1,
      });
    }
  }
  return suggestions;
}

export function suggestFromSegments(segments: RouteSegment[]): ItinerarySuggestion[] {
  const continuityIssues = validateSegmentContinuity(segments);
  if (continuityIssues.length === 0) return [];
  return suggestItineraryFixes(segments);
}
