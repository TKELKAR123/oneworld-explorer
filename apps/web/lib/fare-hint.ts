import type { RouteAnalysis, TravelClass } from "@oneworld-explorer/core";

/** Explorer booking-class letter (fare basis prefix). */
export function bookingClassLetter(travelClass: TravelClass): string {
  if (travelClass === "business") return "D";
  if (travelClass === "first") return "A";
  return "L";
}

export function fareHintLabel(
  analysis: RouteAnalysis | null,
  travelClass: TravelClass,
): string | null {
  if (!analysis?.suggestedFareBasis) return null;

  if (travelClass === "premium-economy") {
    const base = analysis.suggestedFareBasis.replace(/\s*\(\+.*\)$/, "");
    return `Explorer economy (${base}) + premium cabin surcharge per flown segment`;
  }

  const cls =
    travelClass === "business"
      ? "business"
      : travelClass === "first"
        ? "first"
        : "economy";
  return `Explorer ${cls} (${analysis.suggestedFareBasis})`;
}

/** Live cabin tracker copy for the planner sidebar. */
export function cabinFareTrackerLabel(
  analysis: RouteAnalysis | null,
  travelClass: TravelClass,
): string {
  const letter = bookingClassLetter(travelClass);
  const className =
    travelClass === "premium-economy"
      ? "premium economy (L + surcharge)"
      : travelClass === "business"
        ? "business"
        : travelClass === "first"
          ? "first"
          : "economy";

  if (analysis?.suggestedFareBasis) {
    const hint = fareHintLabel(analysis, travelClass);
    return `${hint ?? analysis.suggestedFareBasis} · Book in ${letter} class (${className})`;
  }

  if (analysis && analysis.continentCount >= 3) {
    return `Fare basis pending — book in ${letter} class (${className}) once route validates`;
  }

  return `Book in ${letter} class (${className}) — need 3+ continents for LONE/DONE/AONE code`;
}
