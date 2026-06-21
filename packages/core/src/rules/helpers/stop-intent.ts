import type { ParsedItinerary, StopIntent } from "../../ontology/types.js";

export function hasDeclaredStopIntents(stopIntents?: StopIntent[]): boolean {
  return Boolean(stopIntents?.some((i) => i === "stopover" || i === "connection"));
}

/** Count stopovers from user-declared intent at intermediate stops (not origin). */
export function countDeclaredStopovers(
  itinerary: ParsedItinerary,
  stopIntents?: StopIntent[],
): { total: number; inOriginContinent: number } {
  if (!stopIntents?.length) return { total: 0, inOriginContinent: 0 };

  const originContinent = itinerary.points[0]!.continent;
  let total = 0;
  let inOriginContinent = 0;

  for (let stopIndex = 1; stopIndex < itinerary.points.length - 1; stopIndex++) {
    const intent = stopIntents[stopIndex] ?? "unknown";
    if (intent !== "stopover") continue;
    total++;
    const point = itinerary.points[stopIndex]!;
    if (point.continent === originContinent) inOriginContinent++;
  }

  return { total, inOriginContinent };
}
