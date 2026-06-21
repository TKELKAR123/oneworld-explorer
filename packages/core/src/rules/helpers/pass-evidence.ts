import type { EvaluationContext } from "../../ontology/types.js";

export function buildPassEvidence(
  ruleId: string,
  ctx: EvaluationContext,
): string[] {
  const { analysis, itinerary } = ctx;

  switch (ruleId) {
    case "R3015-4a":
      return [
        `Atlantic crossings: ${analysis.crossesAtlantic ? 1 : 0}`,
        `Pacific crossings: ${analysis.crossesPacific ? 1 : 0}`,
      ];
    case "R3015-4b-direction":
      return analysis.direction
        ? [`Direction: ${analysis.direction}bound`]
        : ["Direction: continuous TC travel"];
    case "R3015-0-continent-count":
      return [
        `Continents charged: ${analysis.continentCount} (${analysis.continentsVisited.join(", ")})`,
      ];
    case "R3015-0-fare-basis":
      return analysis.suggestedFareBasis
        ? [`Suggested fare basis: ${analysis.suggestedFareBasis}`]
        : [];
    case "R3015-4h-continent-limits":
      return Object.entries(analysis.flightSegmentsByContinent)
        .filter(([, n]) => n > 0)
        .map(([c, n]) => `${c}: ${n} segment(s)`);
    case "R3015-4h-segment-count":
      return [`Total segments: ${analysis.totalSegments}`];
    case "R3015-itinerary-continuity":
      return [`${itinerary.points.length} stops, ${itinerary.segments.length} legs chained`];
    default:
      return [];
  }
}
