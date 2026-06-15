import type {
  Continent,
  Direction,
  ParsedItinerary,
  RouteAnalysis,
  ValidateOptions,
} from "./ontology/types.js";
import {
  segmentCrossesAtlantic,
  segmentCrossesPacific,
  tcDirectionValid,
} from "./rules/helpers/geometry.js";
import {
  continentsCharged,
  suggestedFareBasis,
} from "./rules/helpers/pricing.js";
import {
  freeFlightSegmentsUsed,
} from "./rules/helpers/segments.js";

const ALL_CONTINENTS: Continent[] = [
  "europe-middle-east",
  "africa",
  "asia",
  "south-west-pacific",
  "north-america",
  "south-america",
];

export function analyzeRoute(
  itinerary: ParsedItinerary,
  options: ValidateOptions = {},
): RouteAnalysis {
  const travelClass = options.travelClass ?? "economy";
  const charged = continentsCharged(itinerary);

  let atlanticCount = 0;
  let pacificCount = 0;
  const segmentDetails = itinerary.segments.map((seg, index) => {
    const from = itinerary.points[index]!;
    const to = itinerary.points[index + 1]!;
    const crossesAtl = segmentCrossesAtlantic(from, to);
    const crossesPac = segmentCrossesPacific(from, to);
    if (crossesAtl) atlanticCount++;
    if (crossesPac) pacificCount++;

    const zoneTransition =
      from.zone !== to.zone ? { from: from.zone, to: to.zone } : null;

    return {
      index,
      from,
      to,
      surface: Boolean(seg.surface),
      fromContinent: from.continent,
      toContinent: to.continent,
      crossesAtlantic: crossesAtl,
      crossesPacific: crossesPac,
      zoneTransition,
    };
  });

  const flightSegmentsByContinent = Object.fromEntries(
    ALL_CONTINENTS.map((c) => [c, freeFlightSegmentsUsed(c, itinerary)]),
  ) as Record<Continent, number>;

  const tcSeq = itinerary.points.map((p) => p.zone);
  const direction: Direction | null = tcDirectionValid(tcSeq) ? "east" : null;

  return {
    segments: segmentDetails,
    continentsVisited: charged,
    continentCount: charged.length,
    suggestedFareBasis: suggestedFareBasis(charged.length, travelClass),
    direction,
    flightSegmentsByContinent,
    totalSegments: itinerary.segments.length,
    crossesAtlantic: atlanticCount === 1,
    crossesPacific: pacificCount === 1,
  };
}
