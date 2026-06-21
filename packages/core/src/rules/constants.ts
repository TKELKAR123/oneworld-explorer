import type { Continent, TrafficZone, TravelClass } from "../ontology/types.js";

export const RULES_VERSION = "2026-02-27";

export const EXPLORER_RULES = {
  minSegments: 3,
  maxSegments: 16,
  minContinents: 3,
  maxContinents: 6,
  maxTravelMonths: 12,
  flightSegmentLimits: {
    "europe-middle-east": 4,
    africa: 4,
    asia: 4,
    "south-west-pacific": 4,
    "north-america": 6,
    "south-america": 4,
  } satisfies Record<Continent, number>,
  threeContinentOrigins: [
    "asia",
    "europe-middle-east",
    "north-america",
  ] satisfies Continent[],
} as const;

export const CONTINENT_ZONE: Record<Continent, TrafficZone> = {
  "north-america": "TC1",
  "south-america": "TC1",
  "europe-middle-east": "TC2",
  africa: "TC2",
  asia: "TC3",
  "south-west-pacific": "TC3",
};

export const EASTBOUND_ZONE_ORDER: TrafficZone[] = ["TC1", "TC2", "TC3"];

export const FARE_BASIS: Record<
  number,
  Record<Exclude<TravelClass, "premium-economy">, string>
> = {
  3: { economy: "LONE3", business: "DONE3", first: "AONE3" },
  4: { economy: "LONE4", business: "DONE4", first: "AONE4" },
  5: { economy: "LONE5", business: "DONE5", first: "AONE5" },
  6: { economy: "LONE6", business: "DONE6", first: "AONE6" },
};

export const ELIGIBLE_CARRIERS = new Set([
  "AA", "AS", "AT", "AY", "BA", "CX", "FJ", "IB", "JL", "MH", "NU", "QF", "QR", "RJ", "UL", "WY",
]);

export const CA_TRANSCON_COLUMN_A = new Set(["ON", "QC", "NB", "NS", "PE", "NL"]);
export const CA_TRANSCON_COLUMN_B = new Set(["BC", "AB", "SK", "MB", "YT", "NT", "NU"]);

export const US_TRANSCON_COLUMN_A = new Set([
  "AZ", "FL", "IN", "KY", "MI", "NC", "OH", "PA", "SC", "TN", "VA",
]);

export const US_TRANSCON_COLUMN_B = new Set([
  "CA", "CT", "GA", "MD", "MA", "NJ", "NY", "OR", "WA", "DC",
]);

export const AU_RESTRICTED_PAIRS: Array<[string, string[]]> = [
  ["BME", ["BNE", "MEL", "SYD"]],
  ["DRW", ["CBR", "MEL", "SYD"]],
  ["KTA", ["BNE", "MEL", "SYD"]],
  ["PER", ["BNE", "CBR", "CNS", "SYD", "MEL"]],
];

export const HAWAII_AIRPORTS = new Set(["HNL", "OGG", "KOA", "LIH", "ITO"]);
