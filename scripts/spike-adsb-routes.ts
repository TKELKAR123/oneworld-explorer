/**
 * Spike: inspect ADS-B quarterly route fixture (no download in CI).
 * Usage: tsx scripts/spike-adsb-routes.ts [fixturePath]
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const defaultFixture = join(repoRoot, "data/fixtures/adsb-routes-q1-2026.json");

interface ObservedRoute {
  carrier: string;
  from: string;
  to: string;
  source: string;
  lastSeenQuarter?: string;
}

function main() {
  const fixturePath = process.argv[2] ?? defaultFixture;
  if (!existsSync(fixturePath)) {
    console.error(`Fixture not found: ${fixturePath}`);
    process.exit(1);
  }
  const rows = JSON.parse(readFileSync(fixturePath, "utf-8")) as ObservedRoute[];
  const pairs = new Set(rows.map((r) => `${r.from}-${r.to}`));
  console.log(`Observed routes: ${rows.length} rows, ${pairs.size} unique OD pairs`);
  console.log("Sample:", rows.slice(0, 5));
  const oslLhr = rows.filter(
    (r) =>
      (r.from === "OSL" && r.to === "LHR") || (r.from === "LHR" && r.to === "OSL"),
  );
  console.log(`OSL↔LHR observed: ${oslLhr.length} rows`);
  const nrtJfk = rows.filter(
    (r) =>
      (r.from === "NRT" && r.to === "JFK") || (r.from === "JFK" && r.to === "NRT"),
  );
  console.log(`NRT↔JFK observed: ${nrtJfk.length} rows (expect 0 — inactive override)`);
}

main();
