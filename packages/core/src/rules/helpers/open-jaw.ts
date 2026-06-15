import type { Airport, ParsedItinerary } from "../../ontology/types.js";

export function hasSurfaceSegment(itinerary: ParsedItinerary): boolean {
  return itinerary.segments.some((s) => s.surface);
}

export function isSurfaceOpenJaw(itinerary: ParsedItinerary): boolean {
  const origin = itinerary.points[0]!;
  const termination = itinerary.points[itinerary.points.length - 1]!;
  if (origin.iata === termination.iata) return false;
  return hasSurfaceSegment(itinerary);
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

export function detectOpenJawType(itinerary: ParsedItinerary): OpenJawType | null {
  if (!isSurfaceOpenJaw(itinerary)) return null;
  const origin = itinerary.points[0]!;
  const termination = itinerary.points[itinerary.points.length - 1]!;

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
  if (mvSet.has(origin.country) && mvSet.has(termination.country) && origin.country !== termination.country) {
    return "mv-lk-in";
  }

  return null;
}

export function openJawPermitted(itinerary: ParsedItinerary): boolean {
  const origin = itinerary.points[0]!;
  const termination = itinerary.points[itinerary.points.length - 1]!;
  if (origin.iata === termination.iata) return true;
  return detectOpenJawType(itinerary) !== null;
}
