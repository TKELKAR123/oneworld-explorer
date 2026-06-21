import type { ParsedItinerary, RouteAnalysis, ValidationIssue } from "../ontology/types.js";

export function buildGuidanceIssues(
  itinerary: ParsedItinerary,
  analysis: RouteAnalysis,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const filled = itinerary.points.filter((p) => /^[A-Z]{3}$/i.test(p.iata?.trim() ?? "")).length;

  if (filled < 4) {
    issues.push({
      code: "GUIDE-add-stops",
      severity: "info",
      message: "Add more stops — full Rule 3015 checks run once you have a return airport and 3+ continents.",
    });
    return issues;
  }

  if (analysis.originReturn.mode === "openJawPending") {
    issues.push({
      code: "GUIDE-set-return",
      severity: "info",
      message:
        analysis.originReturn.pendingHint ??
        "Pick a permitted return airport using “Where you can finish”.",
    });
  }

  if (analysis.continentCount < 3) {
    issues.push({
      code: "GUIDE-continents",
      severity: "info",
      message: `Need at least 3 charged continents for Explorer — currently ${analysis.continentCount}.`,
    });
  }

  const hasPacific = analysis.segments.some((s) => s.crossesPacific);
  const hasAtlantic = analysis.segments.some((s) => s.crossesAtlantic);
  const last = itinerary.points[itinerary.points.length - 1];
  const lastContinent = last?.continent;

  if (!hasPacific && lastContinent && lastContinent !== "north-america" && filled >= 4) {
    issues.push({
      code: "GUIDE-finish-via-na",
      severity: "info",
      message:
        "Route likely needs a Pacific crossing via North America before returning — add US/Canada stops before Europe/Africa finish.",
    });
  }

  if (!hasAtlantic && hasPacific && filled >= 6) {
    issues.push({
      code: "GUIDE-atlantic",
      severity: "info",
      message: "Add an Atlantic crossing (e.g. US/EU) before finishing — required for Explorer.",
    });
  }

  return issues;
}
