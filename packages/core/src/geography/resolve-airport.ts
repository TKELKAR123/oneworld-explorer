import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Airport,
  Continent,
  SubZone,
  TrafficZone,
} from "../ontology/types.js";
import { CONTINENT_ZONE, HAWAII_AIRPORTS } from "../rules/constants.js";

const repoRoot = (() => {
  const candidates = [
    join(dirname(fileURLToPath(import.meta.url)), "../../../.."),
    process.cwd(),
    join(process.cwd(), ".."),
    join(process.cwd(), "../.."),
  ];
  for (const root of candidates) {
    if (
      existsSync(join(root, "data/airports.generated.json")) ||
      existsSync(join(root, "data/airports.json"))
    ) {
      return root;
    }
  }
  return join(dirname(fileURLToPath(import.meta.url)), "../../../..");
})();

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
  caProvince?: string;
  searchTerms?: string[];
}

interface AirportOverride {
  name?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  usState?: string;
  caProvince?: string;
  searchTerms?: string[];
}

/** Boost major hubs when country-wide search returns many matches. */
const HUB_PRIORITY: Record<string, number> = {
  KUL: 10,
  PEN: 8,
  BKI: 6,
  LGK: 5,
  HND: 10,
  NRT: 9,
  LHR: 10,
  JFK: 10,
  SIN: 10,
  HKG: 10,
  DXB: 10,
  DOH: 9,
  OSL: 9,
  TOS: 5,
  BGO: 5,
  SYD: 10,
  LAX: 10,
};

let countryMap: Map<string, CountryEntry> | null = null;
let countryNames: Map<string, string> | null = null;
let airportMap: Map<string, Airport> | null = null;
let searchTermsMap: Map<string, string[]> | null = null;

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

function loadCountryNames(): Map<string, string> {
  if (countryNames) return countryNames;
  const path = join(repoRoot, "data/country-names.json");
  if (!existsSync(path)) {
    countryNames = new Map();
    return countryNames;
  }
  const raw = JSON.parse(readFileSync(path, "utf-8")) as Record<string, string>;
  countryNames = new Map(Object.entries(raw));
  return countryNames;
}

export function getCountryDisplayName(iso: string): string {
  return loadCountryNames().get(iso.toUpperCase()) ?? iso.toUpperCase();
}

function loadOverrides(): Map<string, AirportOverride> {
  const path = join(repoRoot, "data/airport-overrides.json");
  if (!existsSync(path)) return new Map();
  const raw = JSON.parse(readFileSync(path, "utf-8")) as Record<string, AirportOverride>;
  return new Map(Object.entries(raw).map(([k, v]) => [k.toUpperCase(), v]));
}

function loadSearchTerms(): Map<string, string[]> {
  if (searchTermsMap) return searchTermsMap;
  searchTermsMap = new Map();
  for (const [iata, patch] of loadOverrides()) {
    if (patch.searchTerms?.length) {
      searchTermsMap.set(iata, patch.searchTerms);
    }
  }
  return searchTermsMap;
}

function loadAirportsFile(): string {
  const generated = join(repoRoot, "data/airports.generated.json");
  const legacy = join(repoRoot, "data/airports.json");
  try {
    return readFileSync(generated, "utf-8");
  } catch {
    return readFileSync(legacy, "utf-8");
  }
}

function loadAirports(): Map<string, Airport> {
  if (airportMap) return airportMap;
  const raw = loadAirportsFile();
  const entries = JSON.parse(raw) as AirportEntry[];
  const countries = loadCountries();
  const overrides = loadOverrides();
  airportMap = new Map();

  for (const entry of entries) {
    const key = entry.iata.toUpperCase();
    const patch = overrides.get(key);
    const merged: AirportEntry = patch ? { ...entry, ...patch, iata: key } : entry;
    const airport = buildAirport(merged, countries);
    airportMap.set(key, airport);
  }

  for (const [iata, patch] of overrides) {
    if (airportMap.has(iata)) continue;
    const airport = buildAirport(
      { iata, name: iata, city: iata, country: patch.country ?? "XX", ...patch },
      countries,
    );
    airportMap.set(iata, airport);
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
    caProvince: entry.caProvince,
    latitude: entry.latitude,
    longitude: entry.longitude,
  };
}

export function resolveAirport(iata: string): Airport | null {
  const code = iata.trim().toUpperCase();
  return loadAirports().get(code) ?? null;
}

function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export function searchAirports(query: string, limit = 10): Airport[] {
  const q = normalizeSearch(query.trim());
  if (!q) return [];
  const all = [...loadAirports().values()];
  const names = loadCountryNames();
  const terms = loadSearchTerms();

  const scored = all
    .map((a) => {
      let score = 0;
      const iata = a.iata.toUpperCase();
      const city = normalizeSearch(a.city);
      const name = normalizeSearch(a.name);
      const countryIso = a.country.toUpperCase();
      const countryName = normalizeSearch(names.get(countryIso) ?? countryIso);
      const extraTerms = terms.get(iata) ?? [];

      if (iata === q) score = 100;
      else if (iata.startsWith(q)) score = 80;
      else if (city.includes(q)) score = 60;
      else if (extraTerms.some((t) => normalizeSearch(t).includes(q))) score = 55;
      else if (countryName.includes(q)) score = 50;
      else if (countryIso === q && q.length === 2) score = 48;
      else if (name.includes(q)) score = 40;
      else return null;

      score += HUB_PRIORITY[iata] ?? 0;
      return { airport: a, score };
    })
    .filter((x): x is { airport: Airport; score: number } => x !== null)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (HUB_PRIORITY[b.airport.iata] ?? 0) - (HUB_PRIORITY[a.airport.iata] ?? 0) ||
        a.airport.iata.localeCompare(b.airport.iata),
    );
  return scored.slice(0, limit).map((x) => x.airport);
}

export function getCountryMapping(iso: string): CountryEntry | undefined {
  return loadCountries().get(iso.toUpperCase());
}

export function listAllAirports(): Airport[] {
  return [...loadAirports().values()];
}

export function listAirportsInCountry(countryIso: string): Airport[] {
  const iso = countryIso.toUpperCase();
  return listAllAirports().filter((a) => a.country === iso);
}
