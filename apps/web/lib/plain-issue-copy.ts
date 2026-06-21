import type { ValidationIssue } from "@oneworld-explorer/core";

const HEADLINES: Record<string, string> = {
  "R3015-8-stopovers": "Need at least 2 stopovers (24+ hours each)",
  "R3015-6-min-stay": "Minimum stay between first and last international flight not met",
  "R3015-7-max-stay": "Trip exceeds 12 months from first departure",
  "R3015-4-carriers": "Ineligible airline on one or more flights",
  "R3015-9-transfers": "Ineligible operating carrier on a connection",
  "R3015-4c-origin": "Return airport not permitted with your origin",
  "R3015-4f-origin-intl": "Too many international departures from the US",
  "R3015-0-continent-count": "Continent count outside Explorer limits",
  "R3015-4e-intercon": "Too many ocean crossings or intercontinental sectors",
  "R3015-4h-segment-count": "Too many flight segments in a region",
  "R3015-itinerary-continuity": "Route has a gap — stops must connect",
  UNKNOWN_AIRPORT: "Unknown airport code",
};

export function plainIssueHeadline(issue: ValidationIssue): string {
  const mapped = HEADLINES[issue.code];
  if (mapped) return mapped;
  if (issue.naturalLanguage && !issue.naturalLanguage.includes("§")) {
    return issue.naturalLanguage.slice(0, 120);
  }
  return issue.message?.replace(/\s*per §[\d(a-z)(]+.*$/i, "") ?? issue.code;
}

export function plainIssueDetail(issue: ValidationIssue): string | undefined {
  if (issue.message && issue.message !== plainIssueHeadline(issue)) {
    return issue.message;
  }
  return undefined;
}
