import { resolveAirport } from "./geography/resolve-airport.js";
import type {
  ParsedItinerary,
  RouteInput,
  RouteSegment,
  ValidationIssue,
} from "./ontology/types.js";

export function normalizeSegments(input: RouteInput): RouteSegment[] {
  if (input.length === 0) return [];
  if (typeof input[0] === "string") {
    const codes = input as string[];
    const segments: RouteSegment[] = [];
    for (let i = 0; i < codes.length - 1; i++) {
      segments.push({ from: codes[i]!, to: codes[i + 1]! });
    }
    return segments;
  }
  return input as RouteSegment[];
}

export function parseRoute(input: RouteInput): {
  itinerary: ParsedItinerary | null;
  issues: ValidationIssue[];
} {
  const segments = normalizeSegments(input);
  const issues: ValidationIssue[] = [];
  const points = [];

  if (segments.length === 0) {
    return { itinerary: null, issues: [{ code: "EMPTY_ROUTE", severity: "error", message: "Route must have at least one segment." }] };
  }

  const firstFrom = resolveAirport(segments[0]!.from);
  if (!firstFrom) {
    issues.push({
      code: "UNKNOWN_AIRPORT",
      severity: "error",
      message: `Unknown airport: ${segments[0]!.from}`,
      segmentIndex: 0,
    });
    return { itinerary: null, issues };
  }
  points.push(firstFrom);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const to = resolveAirport(seg.to);
    if (!to) {
      issues.push({
        code: "UNKNOWN_AIRPORT",
        severity: "error",
        message: `Unknown airport: ${seg.to}`,
        segmentIndex: i,
      });
      return { itinerary: null, issues };
    }
    points.push(to);
  }

  return { itinerary: { segments, points }, issues };
}
