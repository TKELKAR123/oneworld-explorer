/**
 * Build eligible route index from Jonty/FlightsFrom weekly JSON filtered by CARRIER-REGISTRY.
 * Also emits network-nodes.json and network-edges.json for globe explorer.
 * Usage: npm run build:routes [-- --offline] [-- --fetch]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  JONTY_VENDOR_FILENAME,
  parseJontyRoutes,
  type JontyAirportEntry,
} from "../packages/schedules/src/jonty-routes.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = join(repoRoot, "data/vendor");
const vendorPath = join(vendorDir, JONTY_VENDOR_FILENAME);
const registryPath = join(repoRoot, "data/CARRIER-REGISTRY.json");
const metaPath = join(repoRoot, "data/routes-source.meta.json");
const outPath = join(repoRoot, "data/eligible-routes.index.json");
const nodesPath = join(repoRoot, "data/network-nodes.json");
const edgesPath = join(repoRoot, "data/network-edges.json");
const spinePath = join(repoRoot, "data/network-spine.json");

const SPINE_HUBS = [
  "JFK",
  "LAX",
  "ORD",
  "MIA",
  "LHR",
  "CDG",
  "MAD",
  "DOH",
  "DXB",
  "SIN",
  "HKG",
  "SYD",
  "NRT",
  "HND",
  "ICN",
  "BKK",
  "KUL",
];

function eligibleCarriers(): Set<string> {
  const reg = JSON.parse(readFileSync(registryPath, "utf-8")) as {
    eligible: Array<{ iata: string }>;
    affiliates: Array<{ iata: string }>;
  };
  const set = new Set<string>();
  for (const c of reg.eligible) set.add(c.iata.toUpperCase());
  for (const a of reg.affiliates ?? []) set.add(a.iata.toUpperCase());
  return set;
}

interface RoutePairRow {
  carrier: string;
  from: string;
  to: string;
  source: string;
}

interface AirportRow {
  iata: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

function loadAirportLookup(): Map<string, AirportRow> {
  const path = join(repoRoot, "data/airports.generated.json");
  const rows = JSON.parse(readFileSync(path, "utf-8")) as AirportRow[];
  return new Map(rows.map((a) => [a.iata.toUpperCase(), a]));
}

function loadCountryContinents(): Map<string, string> {
  const path = join(repoRoot, "data/COUNTRY-MAP.json");
  const rows = JSON.parse(readFileSync(path, "utf-8")) as Array<{
    iso: string;
    explorerContinent: string;
  }>;
  return new Map(rows.map((c) => [c.iso.toUpperCase(), c.explorerContinent]));
}

function continentFor(airport: AirportRow, countries: Map<string, string>): string | null {
  const country = airport.country.toUpperCase();
  if (country === "RU" && airport.longitude !== undefined) {
    return airport.longitude >= 60 ? "asia" : "europe-middle-east";
  }
  return countries.get(country) ?? null;
}

function buildNetworkArtifacts(pairs: RoutePairRow[]): void {
  const airports = loadAirportLookup();
  const countries = loadCountryContinents();
  const degree = new Map<string, number>();
  const edgeCarriers = new Map<string, Set<string>>();

  for (const r of pairs) {
    degree.set(r.from, (degree.get(r.from) ?? 0) + 1);
    degree.set(r.to, (degree.get(r.to) ?? 0) + 1);
    const key = [r.from, r.to].sort().join("-");
    let carriers = edgeCarriers.get(key);
    if (!carriers) {
      carriers = new Set();
      edgeCarriers.set(key, carriers);
    }
    carriers.add(r.carrier);
  }

  const missingCoords: string[] = [];
  const nodes = [...degree.keys()]
    .sort()
    .map((iata) => {
      const airport = airports.get(iata);
      if (!airport?.latitude || !airport?.longitude) {
        missingCoords.push(iata);
      }
      return {
        iata,
        lat: airport?.latitude ?? null,
        lon: airport?.longitude ?? null,
        continent: airport ? continentFor(airport, countries) : null,
        degree: degree.get(iata) ?? 0,
      };
    });

  if (missingCoords.length > 0) {
    throw new Error(
      `Network nodes missing coordinates: ${missingCoords.join(", ")} — fix airport-overrides and npm run build:airports`,
    );
  }

  const edges = [...edgeCarriers.entries()]
    .map(([key, carriers]) => {
      const [from, to] = key.split("-") as [string, string];
      return { from, to, carriers: [...carriers].sort() };
    })
    .sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));

  const hubSet = new Set(SPINE_HUBS);
  const spinePairs = new Set<string>();
  for (const hub of SPINE_HUBS) {
    for (const other of SPINE_HUBS) {
      if (hub >= other) continue;
      const key = [hub, other].sort().join("-");
      if (edgeCarriers.has(key)) spinePairs.add(key);
    }
  }
  for (const { from, to } of edges) {
    if (hubSet.has(from) && hubSet.has(to)) {
      spinePairs.add([from, to].sort().join("-"));
    }
  }
  const spine = [...spinePairs]
    .map((key) => {
      const [from, to] = key.split("-") as [string, string];
      return { from, to };
    })
    .slice(0, 48);

  writeFileSync(nodesPath, JSON.stringify(nodes, null, 2));
  writeFileSync(edgesPath, JSON.stringify(edges, null, 2));
  writeFileSync(spinePath, JSON.stringify(spine, null, 2));
  console.log(`Wrote ${nodes.length} network nodes, ${edges.length} edges, ${spine.length} spine pairs`);
}

function futureMemberCarriers(): string[] {
  const reg = JSON.parse(readFileSync(registryPath, "utf-8")) as {
    futureMembers?: Array<{ iata: string }>;
  };
  return (reg.futureMembers ?? []).map((c) => c.iata.toUpperCase());
}

function buildFutureMemberPreview(data: Record<string, JontyAirportEntry>): void {
  const codes = futureMemberCarriers();
  if (codes.length === 0) return;
  const previewPath = join(repoRoot, "data/future-member-routes.preview.json");
  const { pairs } = parseJontyRoutes(data, new Set(), {
    carrierFilter: new Set(codes),
    source: "future-member-preview",
  });
  writeFileSync(previewPath, JSON.stringify(pairs, null, 2));
  console.log(`Wrote ${pairs.length} future-member preview routes to ${previewPath}`);
}

function updateMetaPairCount(pairCount: number, airportCount: number): void {
  if (!existsSync(metaPath)) return;
  const meta = JSON.parse(readFileSync(metaPath, "utf-8")) as Record<string, unknown>;
  meta.eligiblePairCount = pairCount;
  meta.airportCount = airportCount;
  meta.builtAt = new Date().toISOString();
  writeFileSync(metaPath, JSON.stringify(meta, null, 2));
}

function ensureVendor(offline: boolean, fetch: boolean): void {
  if (fetch) {
    const result = spawnSync("npm", ["run", "fetch:routes-vendor"], {
      cwd: repoRoot,
      stdio: "inherit",
      shell: true,
    });
    if (result.status !== 0) {
      throw new Error("fetch:routes-vendor failed");
    }
    return;
  }

  if (!existsSync(vendorPath)) {
    if (offline) {
      throw new Error(
        `Missing ${vendorPath} — run npm run fetch:routes-vendor or npm run refresh:routes`,
      );
    }
    const spikePath = join(vendorDir, "spikes/jonty-airline_routes.json");
    if (existsSync(spikePath)) {
      mkdirSync(vendorDir, { recursive: true });
      writeFileSync(vendorPath, readFileSync(spikePath));
      console.log(`Using spike copy at ${spikePath}`);
      return;
    }
    throw new Error(`Missing ${vendorPath} — run npm run fetch:routes-vendor`);
  }
}

function main() {
  const offline = process.argv.includes("--offline");
  const fetch = process.argv.includes("--fetch");

  ensureVendor(offline, fetch);

  const raw = readFileSync(vendorPath, "utf-8");
  const data = JSON.parse(raw) as Record<string, JontyAirportEntry>;
  const { pairs, stats } = parseJontyRoutes(data, eligibleCarriers());

  if (stats.pairCount < 5000) {
    throw new Error(`Eligible pair count too low (${stats.pairCount})`);
  }

  writeFileSync(outPath, JSON.stringify(pairs, null, 2));
  console.log(`Wrote ${pairs.length} eligible route pairs to ${outPath}`);
  buildNetworkArtifacts(pairs);
  buildFutureMemberPreview(data);
  updateMetaPairCount(stats.pairCount, stats.airportCount);
}

main();
