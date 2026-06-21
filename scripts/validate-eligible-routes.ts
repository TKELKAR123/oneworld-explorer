import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FLIGHTSFROM_WEEKLY_SOURCE } from "../packages/schedules/src/jonty-routes.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(repoRoot, "data/eligible-routes.index.json");
const metaPath = join(repoRoot, "data/routes-source.meta.json");
const nodesPath = join(repoRoot, "data/network-nodes.json");
const edgesPath = join(repoRoot, "data/network-edges.json");

const ALLOWED_SOURCES = new Set([
  FLIGHTSFROM_WEEKLY_SOURCE,
  "adsb-observed",
]);

let errors = 0;
let warnings = 0;

if (!existsSync(indexPath)) {
  console.error("Missing data/eligible-routes.index.json — run: npm run build:routes");
  process.exit(1);
}

const pairs = JSON.parse(readFileSync(indexPath, "utf-8")) as Array<{ source?: string }>;
if (!Array.isArray(pairs) || pairs.length < 1000) {
  console.error(`eligible-routes.index.json looks invalid (${pairs?.length ?? 0} pairs)`);
  process.exit(1);
}

const badSources = pairs.filter((p) => p.source && !ALLOWED_SOURCES.has(p.source));
if (badSources.length > 0) {
  console.error(
    `eligible-routes.index.json has ${badSources.length} rows with unexpected source (expected ${[...ALLOWED_SOURCES].join(", ")})`,
  );
  errors++;
}

console.log(`eligible-routes index OK (${pairs.length} pairs)`);

if (existsSync(metaPath)) {
  const meta = JSON.parse(readFileSync(metaPath, "utf-8")) as { fetchedAt?: string };
  if (meta.fetchedAt) {
    const ageMs = Date.now() - new Date(meta.fetchedAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays > 14) {
      console.warn(
        `routes-source.meta.json fetchedAt is ${ageDays.toFixed(0)} days old (>14) — run npm run refresh:routes`,
      );
      warnings++;
    }
  }
} else {
  console.warn("Missing data/routes-source.meta.json — run npm run fetch:routes-vendor");
  warnings++;
}

if (!existsSync(nodesPath) || !existsSync(edgesPath)) {
  console.error("Missing network-nodes.json or network-edges.json — run: npm run build:routes");
  process.exit(1);
}

const nodes = JSON.parse(readFileSync(nodesPath, "utf-8")) as Array<{
  iata: string;
  lat: number | null;
  lon: number | null;
  degree: number;
}>;
const edges = JSON.parse(readFileSync(edgesPath, "utf-8")) as Array<{
  from: string;
  to: string;
  carriers: string[];
}>;

const nodeSet = new Set(nodes.map((n) => n.iata));
for (const n of nodes) {
  if (n.lat == null || n.lon == null) {
    console.error(`Node ${n.iata} missing coordinates`);
    errors++;
  }
}

for (const e of edges) {
  if (!nodeSet.has(e.from) || !nodeSet.has(e.to)) {
    console.error(`Edge orphan: ${e.from}-${e.to}`);
    errors++;
  }
}

if (edges.length < 2000) {
  console.error(`network-edges.json too small (${edges.length})`);
  errors++;
}

if (errors > 0) {
  console.error(`validate:routes failed (${errors} issues, ${warnings} warnings)`);
  process.exit(1);
}

console.log(`network graph OK (${nodes.length} nodes, ${edges.length} edges)`);
if (warnings > 0) {
  console.log(`validate:routes passed with ${warnings} warning(s)`);
}
