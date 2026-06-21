import type { Airport, ParsedItinerary } from "../../ontology/types.js";

/** Explicit mid-itinerary surface legs (§4(g)), not §4(c) O-D open jaw. */
export function hasSurfaceSegment(itinerary: ParsedItinerary): boolean {
  return itinerary.segments.some((s) => s.surface);
}

/** Origin airport ≠ return airport (O-D open jaw in play). */
export function isOriginDestinationOpenJaw(itinerary: ParsedItinerary): boolean {
  const origin = itinerary.points[0]!;
  const termination = itinerary.points[itinerary.points.length - 1]!;
  return origin.iata !== termination.iata;
}

/** @deprecated Use isOriginDestinationOpenJaw — O-D open jaw does not require an explicit surface leg. */
export function isSurfaceOpenJaw(itinerary: ParsedItinerary): boolean {
  return isOriginDestinationOpenJaw(itinerary);
}

function countries(origin: Airport, termination: Airport): [string, string] {
  return [origin.country, termination.country].sort() as [string, string];
}

export type OpenJawType =
  | "within-origin-country"
  | "within-middle-east"
  | "us-canada"
  | "hkg-china"
  | "my-sin"
  | "within-africa"
  | "mv-lk-in";

function classifyOpenJawEndpoints(origin: Airport, termination: Airport): OpenJawType | null {
  if (origin.country === termination.country) return "within-origin-country";

  if (
    origin.subZone === "middle-east" &&
    termination.subZone === "middle-east"
  ) {
    return "within-middle-east";
  }

  const pair = countries(origin, termination);
  if (pair[0] === "CA" && pair[1] === "US") return "us-canada";

  const cnHkg = (a: Airport) => a.country === "CN" || a.country === "HK";
  if (cnHkg(origin) && cnHkg(termination)) return "hkg-china";

  if (pair[0] === "MY" && pair[1] === "SG") return "my-sin";

  if (origin.continent === "africa" && termination.continent === "africa") {
    return "within-africa";
  }

  const mvSet = new Set(["MV", "LK", "IN"]);
  if (
    mvSet.has(origin.country) &&
    mvSet.has(termination.country) &&
    origin.country !== termination.country
  ) {
    return "mv-lk-in";
  }

  return null;
}

export function detectOpenJawType(itinerary: ParsedItinerary): OpenJawType | null {
  if (!isOriginDestinationOpenJaw(itinerary)) return null;
  const origin = itinerary.points[0]!;
  const termination = itinerary.points[itinerary.points.length - 1]!;
  return classifyOpenJawEndpoints(origin, termination);
}

export function openJawPermitted(itinerary: ParsedItinerary): boolean {
  const origin = itinerary.points[0]!;
  const termination = itinerary.points[itinerary.points.length - 1]!;
  if (origin.iata === termination.iata) return true;
  return detectOpenJawType(itinerary) !== null;
}

/** Ticketed flight directly connecting origin to return is not a permitted O-D open jaw pattern. */
export function hasTicketedOriginReturnConnector(itinerary: ParsedItinerary): boolean {
  if (!isOriginDestinationOpenJaw(itinerary)) return false;
  const origin = itinerary.points[0]!.iata;
  const termination = itinerary.points[itinerary.points.length - 1]!.iata;
  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    if (seg.surface) continue;
    const from = itinerary.points[i]!.iata;
    const to = itinerary.points[i + 1]!.iata;
    if (from === origin && to === termination) return true;
  }
  return false;
}
