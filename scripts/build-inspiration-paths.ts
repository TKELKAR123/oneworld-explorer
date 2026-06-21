/**
 * Build inspiration route overlays from scenario catalog.
 * Usage: tsx scripts/build-inspiration-paths.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(repoRoot, "tests/scenarios/catalog.json");
const outPath = join(repoRoot, "data/inspiration-routes.json");
const airportsPath = join(repoRoot, "data/airports.generated.json");

interface CatalogScenario {
  id: string;
  source?: string;
  tags?: string[];
  segments?: Array<{ from: string; to: string }>;
  expectValid?: boolean;
}

interface AirportRow {
  iata: string;
  latitude?: number;
  longitude?: number;
}

function stopsFromSegments(segments: Array<{ from: string; to: string }>): string[] {
  if (segments.length === 0) return [];
  const stops = [segments[0]!.from.toUpperCase()];
  for (const seg of segments) {
    stops.push(seg.to.toUpperCase());
  }
  return stops;
}

function main() {
  const raw = JSON.parse(readFileSync(catalogPath, "utf-8")) as
    | CatalogScenario[]
    | { scenarios: CatalogScenario[] };
  const scenarios = Array.isArray(raw) ? raw : raw.scenarios;
  const airports = JSON.parse(readFileSync(airportsPath, "utf-8")) as AirportRow[];
  const byIata = new Map(airports.map((a) => [a.iata.toUpperCase(), a]));

  const picked = scenarios.filter(
    (s) =>
      s.tags?.includes("map-inspiration") ||
      s.tags?.includes("smoke-ui") ||
      ["SC-001", "SC-079"].includes(s.id),
  );

  const routes = picked
    .filter((s) => s.segments?.length && s.expectValid !== false)
    .slice(0, 12)
    .map((s) => {
      const stops = stopsFromSegments(s.segments!);
      const points = stops
        .map((iata) => {
          const a = byIata.get(iata);
          if (!a?.latitude || !a?.longitude) return null;
          return { iata, lat: a.latitude, lon: a.longitude };
        })
        .filter(Boolean) as Array<{ iata: string; lat: number; lon: number }>;
      return {
        id: s.id,
        label: s.source?.slice(0, 40) ?? s.id,
        stops,
        points,
      };
    })
    .filter((r) => r.points.length >= 2);

  writeFileSync(outPath, JSON.stringify(routes, null, 2));
  console.log(`Wrote ${routes.length} inspiration routes to ${outPath}`);
}

main();
