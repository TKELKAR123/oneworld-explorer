/**
 * Join world-atlas countries-110m with COUNTRY-MAP → geography-atlas.generated.json
 * Usage: npm run build:geography-atlas
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import countries110m from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import iso3166 from "iso-3166-1";
import type { Continent, SubZone, TrafficZone } from "../packages/core/src/ontology/types.js";
import {
  GEOGRAPHY_ATLAS_UNMAPPED_ALLOWLIST,
  type CountryAtlasEntry,
  type GeographyAtlas,
} from "../packages/core/src/ontology/geography-atlas.js";
import { RULES_VERSION } from "../packages/core/src/rules/constants.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const countryMapPath = join(repoRoot, "data/COUNTRY-MAP.json");
const outPath = join(repoRoot, "data/geography-atlas.generated.json");

const CONTINENT_TO_TC: Record<Continent, TrafficZone> = {
  "north-america": "TC1",
  "south-america": "TC1",
  "europe-middle-east": "TC2",
  africa: "TC2",
  asia: "TC3",
  "south-west-pacific": "TC3",
};

const FALLBACK_CONTINENT: Continent = "asia";

interface CountryMapRow {
  iso: string;
  explorerContinent: Continent;
  explorerSubZone?: SubZone | null;
  trafficZone: TrafficZone;
}

function numericIdToAlpha2(id: string | number): string | null {
  const numeric = String(id).padStart(3, "0");
  const row = iso3166.whereNumeric(numeric);
  return row?.alpha2 ?? null;
}

function buildGeographyAtlas(): GeographyAtlas {
  const countryMap = JSON.parse(readFileSync(countryMapPath, "utf8")) as CountryMapRow[];
  const mapByIso = new Map(countryMap.map((r) => [r.iso, r]));

  const topology = countries110m as unknown as {
    type: "Topology";
    objects: { countries: unknown };
  };
  const land = feature(topology, topology.objects.countries) as GeoJSON.FeatureCollection;

  const unmapped: string[] = [];
  const countries: CountryAtlasEntry[] = [];

  for (const feat of land.features) {
    const iso = numericIdToAlpha2(feat.id ?? "");
    if (!iso) {
      unmapped.push(`numeric:${feat.id}`);
      continue;
    }

    let mapping = mapByIso.get(iso);
    if (!mapping) {
      unmapped.push(iso);
      if (GEOGRAPHY_ATLAS_UNMAPPED_ALLOWLIST.has(iso)) {
        mapping = {
          iso,
          explorerContinent: FALLBACK_CONTINENT,
          explorerSubZone: null,
          trafficZone: CONTINENT_TO_TC[FALLBACK_CONTINENT],
        };
      } else {
        mapping = {
          iso,
          explorerContinent: FALLBACK_CONTINENT,
          explorerSubZone: null,
          trafficZone: CONTINENT_TO_TC[FALLBACK_CONTINENT],
        };
      }
    }

    const geom = feat.geometry;
    if (!geom || (geom.type !== "Polygon" && geom.type !== "MultiPolygon")) continue;

    countries.push({
      iso,
      name: String((feat.properties as { name?: string })?.name ?? iso),
      explorerContinent: mapping.explorerContinent,
      explorerSubZone: mapping.explorerSubZone ?? null,
      trafficZone: mapping.trafficZone,
      geometry: geom as CountryAtlasEntry["geometry"],
    });
  }

  const disallowedUnmapped = unmapped.filter(
    (u) => !u.startsWith("numeric:") && !GEOGRAPHY_ATLAS_UNMAPPED_ALLOWLIST.has(u),
  );

  return {
    version: new Date().toISOString().slice(0, 10),
    rulesVersion: RULES_VERSION,
    countries,
    unmapped: [...new Set(unmapped)],
    ...(disallowedUnmapped.length > 0 ? {} : {}),
  };
}

function main() {
  const atlas = buildGeographyAtlas();
  writeFileSync(outPath, JSON.stringify(atlas));
  console.log(
    `Wrote ${outPath} — ${atlas.countries.length} countries, ${atlas.unmapped.length} unmapped`,
  );

  const disallowed = atlas.unmapped.filter(
    (u) => !u.startsWith("numeric:") && !GEOGRAPHY_ATLAS_UNMAPPED_ALLOWLIST.has(u),
  );
  if (disallowed.length > 5) {
    console.error("Too many unmapped ISO codes without COUNTRY-MAP entry:", disallowed.slice(0, 10));
    process.exit(1);
  }
}

main();
