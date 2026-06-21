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
  if (firstFrom.iata !== segments[0]!.from.trim().toUpperCase()) {
    issues.push({
      code: "R3015-itinerary-continuity",
      severity: "error",
      message: `First segment from ${segments[0]!.from} does not match resolved airport.`,
      segmentIndex: 0,
    });
    return { itinerary: null, issues };
  }
  points.push(firstFrom);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    if (i > 0) {
      const expectedFrom = points[points.length - 1]!.iata;
      const actualFrom = seg.from.trim().toUpperCase();
      if (actualFrom !== expectedFrom) {
        issues.push({
          code: "R3015-itinerary-continuity",
          severity: "error",
          message: `Route jumps from ${expectedFrom} to ${actualFrom} with no connecting leg (segment ${i - 1} ends at ${expectedFrom}, segment ${i} starts at ${actualFrom}).`,
          segmentIndex: i,
          evidence: [`expected ${expectedFrom}, got ${actualFrom}`],
        });
        return { itinerary: null, issues };
      }
    }
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
