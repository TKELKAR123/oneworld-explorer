import type { Continent, ParsedItinerary, TicketContext, TravelClass } from "../../ontology/types.js";
import { EXPLORER_RULES, FARE_BASIS } from "../constants.js";
import { resolveFareProduct } from "./ione3-markets.js";
import { continentsVisited } from "./segments.js";

const SWP: Continent = "south-west-pacific";
const EU_ME: Continent = "europe-middle-east";
const ASIA: Continent = "asia";

const SWP_EU_SURFACE_PAIRS: Array<[string[], string[]]> = [
  [["London"], ["Sydney", "Melbourne", "Perth"]],
  [["Doha"], ["Adelaide", "Auckland", "Canberra", "Melbourne", "Perth", "Sydney"]],
];

function cityMatches(airportCity: string, names: string[]): boolean {
  const c = airportCity.toLowerCase();
  return names.some((n) => c.includes(n.toLowerCase()) || n.toLowerCase().includes(c));
}

export function swpEuViaAsiaPattern(itinerary: ParsedItinerary): boolean {
  for (let i = 0; i < itinerary.segments.length; i++) {
    const seg = itinerary.segments[i]!;
    const from = itinerary.points[i]!;
    const to = itinerary.points[i + 1]!;

    if (seg.surface) {
      for (const [left, right] of SWP_EU_SURFACE_PAIRS) {
        const a = cityMatches(from.city, left) && cityMatches(to.city, right);
        const b = cityMatches(from.city, right) && cityMatches(to.city, left);
        if (a || b) return true;
      }
      continue;
    }

    // Conservative v0.1.1: direct SWP↔EU/ME flights do not trigger until flightNumber known (v0.2)
    if (seg.flightNumber && !seg.surface) {
      const continents = new Set([from.continent, to.continent]);
      if (continents.has(SWP) && continents.has(EU_ME)) return true;
    }
  }
  return false;
}

export function continentsCharged(itinerary: ParsedItinerary): Continent[] {
  const visited = new Set(continentsVisited(itinerary));
  if (swpEuViaAsiaPattern(itinerary)) {
    visited.add(SWP);
    visited.add(EU_ME);
    visited.add(ASIA);
  }
  return [...visited];
}

export function suggestedFareBasis(
  continentCount: number,
  travelClass: TravelClass,
  ticket?: TicketContext,
): string | null {
  if (
    continentCount < EXPLORER_RULES.minContinents ||
    continentCount > EXPLORER_RULES.maxContinents
  ) {
    return null;
  }
  if (travelClass === "premium-economy") {
    const base = FARE_BASIS[continentCount]?.economy;
    return base ? `${base} (+ PE surcharge per segment)` : null;
  }
  if (travelClass === "business" && continentCount === 3) {
    return resolveFareProduct(ticket);
  }
  return FARE_BASIS[continentCount]?.[travelClass] ?? null;
}

export function isThreeContinentOriginAllowed(originContinent: Continent): boolean {
  return (EXPLORER_RULES.threeContinentOrigins as readonly Continent[]).includes(
    originContinent,
  );
}

export function validateThreeContinentOrigin(
  itinerary: ParsedItinerary,
  chargedCount: number,
): boolean {
  if (chargedCount !== 3) return true;
  const origin = itinerary.points[0]!;
  return isThreeContinentOriginAllowed(origin.continent);
}
