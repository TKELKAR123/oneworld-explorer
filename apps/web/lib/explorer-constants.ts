import type { Continent } from "@oneworld-explorer/core";

/** Mirrors packages/core RULES_VERSION — safe for client bundles. */
export const RULES_VERSION = "2026-02-27";

/** Mirrors EXPLORER_RULES.flightSegmentLimits — safe for client bundles. */
export const FLIGHT_SEGMENT_LIMITS: Record<Continent, number> = {
  "europe-middle-east": 4,
  africa: 4,
  asia: 4,
  "south-west-pacific": 4,
  "north-america": 6,
  "south-america": 4,
};

export const FLIGHT_SEGMENT_CONTINENTS = Object.keys(
  FLIGHT_SEGMENT_LIMITS,
) as Continent[];

/** Rule 3015 §4(h) maximum flight segments on an Explorer ticket. */
export const MAX_EXPLORER_SEGMENTS = 16;
