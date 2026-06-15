import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Airport,
  Continent,
  SubZone,
  TrafficZone,
} from "../ontology/types.js";
import { CONTINENT_ZONE, HAWAII_AIRPORTS } from "../rules/constants.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

interface SourceConflict {
  field: string;
  values: Record<string, unknown>;
  note?: string;
}

interface CountrySources {
  rule3015?: {
    explorerContinent: Continent;
    explorerSubZone?: SubZone | null;
    citation?: string;
  };
  qantasGuide?: {
    explorerContinent: Continent;
    regionLabel: string;
    guideUrl: string;
    guideVersion?: string;
    transcribedAt?: string;
    derivedFrom?: string;
  };
  iata?: {
    trafficZone: TrafficZone;
  };
}

interface CountryEntry {
  iso: string;
  explorerContinent: Continent;
  explorerSubZone?: SubZone | null;
  trafficZone: TrafficZone;
  sources: CountrySources;
  resolvedFrom: "rule3015" | "qantasGuide" | "iata" | "geography";
  conflicts?: SourceConflict[];
  notes?: string;
}

interface AirportEntry {
  iata: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  usState?: string;
}

let countryMap: Map<string, CountryEntry> | null = null;
let airportMap: Map<string, Airport> | null = null;

function loadCountries(): Map<string, CountryEntry> {
  if (countryMap) return countryMap;
  const raw = readFileSync(
    join(repoRoot, "data/COUNTRY-MAP.json"),
    "utf-8",
  );
  const entries = JSON.parse(raw) as CountryEntry[];
  countryMap = new Map(entries.map((e) => [e.iso, e]));
  return countryMap;
}

function loadAirports(): Map<string, Airport> {
  if (airportMap) return airportMap;
  const raw = readFileSync(join(repoRoot, "data/airports.json"), "utf-8");
  const entries = JSON.parse(raw) as AirportEntry[];
  const countries = loadCountries();
  airportMap = new Map();

  for (const entry of entries) {
    const airport = buildAirport(entry, countries);
    airportMap.set(entry.iata.toUpperCase(), airport);
  }
  return airportMap;
}

const RUSSIA_URAL_LONGITUDE = 60;

function buildAirport(
  entry: AirportEntry,
  countries: Map<string, CountryEntry>,
): Airport {
  const iata = entry.iata.toUpperCase();
  let country = entry.country.toUpperCase();

  if (HAWAII_AIRPORTS.has(iata)) {
    country = "US";
  }

  let mapping = countries.get(country);
  let continent = mapping?.explorerContinent ?? "asia";
  let subZone = mapping?.explorerSubZone ?? undefined;

  if (country === "RU" && entry.longitude !== undefined) {
    if (entry.longitude >= RUSSIA_URAL_LONGITUDE) {
      continent = "asia";
      subZone = undefined;
    } else {
      continent = "europe-middle-east";
      subZone = "europe";
    }
  }

  return {
    iata,
    name: entry.name,
    city: entry.city,
    country,
    continent,
    zone: CONTINENT_ZONE[continent],
    subZone: subZone ?? undefined,
    usState: entry.usState,
    latitude: entry.latitude,
    longitude: entry.longitude,
  };
}

export function resolveAirport(iata: string): Airport | null {
  const code = iata.trim().toUpperCase();
  return loadAirports().get(code) ?? null;
}

export function searchAirports(query: string, limit = 10): Airport[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const all = [...loadAirports().values()];
  return all
    .filter(
      (a) =>
        a.iata.startsWith(q) ||
        a.city.toUpperCase().includes(q) ||
        a.name.toUpperCase().includes(q),
    )
    .slice(0, limit);
}

export function getCountryMapping(iso: string): CountryEntry | undefined {
  return loadCountries().get(iso.toUpperCase());
}

export function listAllAirports(): Airport[] {
  return [...loadAirports().values()];
}
