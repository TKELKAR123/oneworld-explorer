/**
 * Download Jonty / FlightsFrom weekly route dump to data/vendor/.
 * Usage: npm run fetch:routes-vendor
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { get } from "node:https";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  JONTY_VENDOR_FILENAME,
  parseJontyRoutes,
  type JontyAirportEntry,
} from "../packages/schedules/src/jonty-routes.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = join(repoRoot, "data/vendor");
const vendorPath = join(vendorDir, JONTY_VENDOR_FILENAME);
const metaPath = join(repoRoot, "data/routes-source.meta.json");
const registryPath = join(repoRoot, "data/CARRIER-REGISTRY.json");

const UPSTREAM_URL =
  "https://raw.githubusercontent.com/Jonty/airline-route-data/main/airline_routes.json";

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

async function download(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    get(UPSTREAM_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} fetching ${UPSTREAM_URL}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c as Buffer));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

async function main() {
  console.log(`Fetching ${UPSTREAM_URL}…`);
  const body = await download();
  if (body.length < 1_000_000) {
    throw new Error(`Upstream file suspiciously small (${body.length} bytes)`);
  }

  mkdirSync(vendorDir, { recursive: true });
  writeFileSync(vendorPath, body);

  const sha256 = createHash("sha256").update(body).digest("hex");
  const data = JSON.parse(body.toString("utf-8")) as Record<string, JontyAirportEntry>;
  const { stats } = parseJontyRoutes(data, eligibleCarriers());
  if (stats.pairCount < 5000) {
    throw new Error(`Eligible pair count too low (${stats.pairCount}) — aborting`);
  }

  const fetchedAt = new Date().toISOString();
  const meta = {
    source: "jonty-airline-route-data",
    upstreamUrl: UPSTREAM_URL,
    fetchedAt,
    sha256,
    airportCount: stats.airportCount,
    eligiblePairCount: stats.pairCount,
  };
  writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  console.log(`Wrote ${vendorPath} (${body.length} bytes, sha256=${sha256.slice(0, 12)}…)`);
  console.log(
    `Parsed ${stats.pairCount} eligible pairs from ${stats.airportCount} airports → ${metaPath}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
