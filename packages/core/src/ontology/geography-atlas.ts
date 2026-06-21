import type { Continent, SubZone, TrafficZone } from "./types.js";

export type MapStyleMode = "continents" | "tc-zones" | "countries" | "minimal";

export type GeoPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type GeoMultiPolygon = {
  type: "MultiPolygon";
  coordinates: number[][][][];
};

export interface CountryAtlasEntry {
  iso: string;
  name: string;
  explorerContinent: Continent;
  explorerSubZone: SubZone | null;
  trafficZone: TrafficZone;
  geometry: GeoPolygon | GeoMultiPolygon;
}

export interface GeographyAtlas {
  version: string;
  rulesVersion: string;
  countries: CountryAtlasEntry[];
  unmapped: string[];
}

/** ISO codes allowed without COUNTRY-MAP entry (territories / disputed). */
export const GEOGRAPHY_ATLAS_UNMAPPED_ALLOWLIST = new Set([
  "AQ", // Antarctica
  "PS", // Palestine — may lack full mapping
  "TW", // Taiwan — check if in map
]);
