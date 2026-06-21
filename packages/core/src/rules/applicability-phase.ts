import type { ParsedItinerary, RouteAnalysis, ValidationPhase } from "../ontology/types.js";

/** Rule codes suppressed while the itinerary is still being drafted. */
export const BUILDING_SUPPRESSED_CODES = new Set([
  "R3015-4a",
  "R3015-0-continent-count",
  "R3015-4b-direction",
  "R3015-4h-segment-count",
]);

export function inferValidationPhase(
  itinerary: ParsedItinerary,
  analysis: RouteAnalysis,
): ValidationPhase {
  const filled = itinerary.points.filter((p) => /^[A-Z]{3}$/i.test(p.iata?.trim() ?? "")).length;
  const hasEmptyMiddle = itinerary.points.some(
    (p, i) => i > 0 && i < itinerary.points.length - 1 && !p.iata?.trim(),
  );

  if (filled < 4) return "building";
  if (analysis.continentCount < 3) return "building";
  if (analysis.originReturn.mode === "openJawPending") return "building";
  if (hasEmptyMiddle) return "building";

  return "ticketReady";
}

export function shouldSuppressInBuilding(code: string): boolean {
  return BUILDING_SUPPRESSED_CODES.has(code);
}
