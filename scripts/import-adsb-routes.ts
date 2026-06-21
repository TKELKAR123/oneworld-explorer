/**
 * Import ADS-B observed routes from committed fixture into eligible-routes index merge input.
 * Usage: tsx scripts/import-adsb-routes.ts [--write]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = join(repoRoot, "data/fixtures/adsb-routes-q1-2026.json");
const indexPath = join(repoRoot, "data/eligible-routes.index.json");
const outPath = join(repoRoot, "data/adsb-routes.merged.json");

interface RoutePairRow {
  carrier: string;
  from: string;
  to: string;
  source: string;
  lastSeenQuarter?: string;
}

function mergeRoutes(base: RoutePairRow[], observed: RoutePairRow[]): RoutePairRow[] {
  const seen = new Set<string>();
  const out: RoutePairRow[] = [];
  for (const list of [observed, base]) {
    for (const r of list) {
      const key = `${r.from}-${r.to}-${r.carrier}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
  }
  return out;
}

function main() {
  if (!existsSync(fixturePath)) {
    console.error(`Missing fixture: ${fixturePath}`);
    process.exit(1);
  }
  if (!existsSync(indexPath)) {
    console.error(`Missing index: ${indexPath} — run npm run build:routes first`);
    process.exit(1);
  }

  const observed = JSON.parse(readFileSync(fixturePath, "utf-8")) as RoutePairRow[];
  const base = JSON.parse(readFileSync(indexPath, "utf-8")) as RoutePairRow[];
  const merged = mergeRoutes(base, observed.map((r) => ({ ...r, source: "adsb-observed" })));

  writeFileSync(outPath, JSON.stringify(merged, null, 2));
  console.log(`Merged ${observed.length} observed + ${base.length} base → ${merged.length} rows`);
  console.log(`Wrote ${outPath}`);

  if (process.argv.includes("--write")) {
    writeFileSync(indexPath, JSON.stringify(merged, null, 2));
    console.log(`Updated ${indexPath}`);
  }
}

main();
