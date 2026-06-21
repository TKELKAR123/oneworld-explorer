import type { RouteAnalysis, TravelClass, ValidationOutcome } from "@oneworld-explorer/core";
import { continentLabel } from "./continent-labels";

const CLASS_LABELS: Record<TravelClass, string> = {
  economy: "economy",
  "premium-economy": "premium economy",
  business: "business",
  first: "first",
};

function formatContinents(analysis: RouteAnalysis): string {
  const count = analysis.continentCount;
  const names = analysis.continentsVisited.map((c) => continentLabel(c));
  if (names.length === 0) return `${count} continents`;
  if (names.length <= 3) return `${count} continents (${names.join(", ")})`;
  return `${count} continents (${names.slice(0, 3).join(", ")}, …)`;
}

function oceanCrossings(analysis: RouteAnalysis): string {
  const parts: string[] = [];
  if (analysis.crossesAtlantic) parts.push("Atlantic");
  if (analysis.crossesPacific) parts.push("Pacific");
  if (parts.length === 0) return "no ocean crossings detected";
  return `crosses the ${parts.join(" and ")} once each`;
}

export function buildSummaryNarrative(
  analysis: RouteAnalysis,
  outcome: ValidationOutcome,
  travelClass: TravelClass,
): string {
  const direction = analysis.direction
    ? `${analysis.direction === "east" ? "eastbound" : "westbound"}`
    : "direction unclear";
  const fare = analysis.suggestedFareBasis ?? "fare basis pending";
  const classLabel = CLASS_LABELS[travelClass];

  let intro =
    `This ${direction} round-the-world route touches ${formatContinents(analysis)}, ` +
    `${oceanCrossings(analysis)}, and uses ${analysis.totalSegments} flight segments.`;

  if (analysis.suggestedFareBasis) {
    if (travelClass === "premium-economy") {
      intro += ` Fare: economy Explorer with premium cabin surcharge on flown segments.`;
    } else {
      intro += ` Geography fits ${fare} (${classLabel}).`;
    }
  }

  if (outcome === "validWithWarnings") {
    intro += " Structural checks pass with warnings — review caveats before selling.";
  } else if (outcome === "valid") {
    intro += " All Rule 3015 structural checks in scope pass.";
  }

  return intro;
}
