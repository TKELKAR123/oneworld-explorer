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
import { detectOpenJawType } from "./rules/helpers/open-jaw.js";
import { OPEN_JAW_LABELS } from "./rules/rule-metadata.js";
import type { OriginReturnSummary } from "./ontology/types.js";

function buildOriginReturn(itinerary: ParsedItinerary): OriginReturnSummary {
  const origin = itinerary.points[0]!;
  const termination = itinerary.points[itinerary.points.length - 1]!;

  if (origin.iata === termination.iata) {
    return {
      originIata: origin.iata,
      returnIata: termination.iata,
      originCountry: origin.country,
      returnCountry: termination.country,
      mode: "closedLoop",
      requiresSurface: false,
    };
  }

  const jawType = detectOpenJawType(itinerary);
  if (jawType) {
    return {
      originIata: origin.iata,
      returnIata: termination.iata,
      originCountry: origin.country,
      returnCountry: termination.country,
      mode: "openJaw",
      openJawType: jawType,
      openJawLabel: OPEN_JAW_LABELS[jawType],
      requiresSurface: false,
    };
  }

  return {
    originIata: origin.iata,
    returnIata: termination.iata,
    originCountry: origin.country,
    returnCountry: termination.country,
    mode: "openJawPending",
    requiresSurface: false,
    pendingHint: `Return (${termination.iata}) is not in a permitted §4(c) open-jaw pair with origin (${origin.iata}).`,
  };
}

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
    suggestedFareBasis: suggestedFareBasis(charged.length, travelClass, options.ticket),
    direction,
    flightSegmentsByContinent,
    totalSegments: itinerary.segments.length,
    crossesAtlantic: atlanticCount === 1,
    crossesPacific: pacificCount === 1,
    originReturn: buildOriginReturn(itinerary),
  };
}
