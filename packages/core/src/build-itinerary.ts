import type {
  RouteSegment,
  StopListInput,
  ValidationIssue,
} from "./ontology/types.js";

export function stopsToLegs(
  stops: string[],
  legTypes?: ("flight" | "surface")[],
): RouteSegment[] {
  if (stops.length < 2) return [];
  const legs: RouteSegment[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    legs.push({
      from: stops[i]!.trim().toUpperCase(),
      to: stops[i + 1]!.trim().toUpperCase(),
      surface: legTypes?.[i] === "surface",
    });
  }
  return legs;
}

export function validateSegmentContinuity(
  segments: RouteSegment[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 1; i < segments.length; i++) {
    const prev = segments[i - 1]!.to.trim().toUpperCase();
    const curr = segments[i]!.from.trim().toUpperCase();
    if (prev !== curr) {
      issues.push({
        code: "R3015-itinerary-continuity",
        severity: "error",
        message: `Route jumps from ${prev} to ${curr} with no connecting leg (segment ${i - 1} ends at ${prev}, segment ${i} starts at ${curr}).`,
        segmentIndex: i,
        evidence: [`expected ${prev}, got ${curr}`],
      });
    }
  }
  return issues;
}

export function buildItineraryFromStops(input: StopListInput): {
  segments: RouteSegment[];
  issues: ValidationIssue[];
} {
  const stops = input.stops.map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (stops.length < 2) {
    return {
      segments: [],
      issues: [
        {
          code: "EMPTY_ROUTE",
          severity: "error",
          message: "At least two stops are required.",
        },
      ],
    };
  }
  const legTypes = input.legTypes;
  if (legTypes && legTypes.length !== stops.length - 1) {
    return {
      segments: [],
      issues: [
        {
          code: "INVALID_LEG_TYPES",
          severity: "error",
          message: `legTypes length must be ${stops.length - 1}, got ${legTypes.length}.`,
        },
      ],
    };
  }
  return { segments: stopsToLegs(stops, legTypes), issues: [] };
}

export function normalizeLegacySegments(segments: RouteSegment[]): {
  segments: RouteSegment[];
  issues: ValidationIssue[];
} {
  const normalized = segments.map((s) => ({
    ...s,
    from: s.from.trim().toUpperCase(),
    to: s.to.trim().toUpperCase(),
  }));
  return { segments: normalized, issues: validateSegmentContinuity(normalized) };
}
