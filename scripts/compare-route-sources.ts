#!/usr/bin/env npx tsx
/**
 * Compare OpenFlights vs Kiwi fixtures against route-benchmark-corpus.json.
 * Usage: npx tsx scripts/compare-route-sources.ts [--write-doc]
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadOpenFlightsRoutes } from "../packages/schedules/src/openflights-routes.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS_PATH = join(ROOT, "data/fixtures/route-benchmark-corpus.json");
const FIXTURE_DIR = join(ROOT, "tests/schedules/fixtures");
const DOC_PATH = join(ROOT, "docs/research/kiwi-benchmark-comparison.md");

interface CorpusEntry {
  id: string;
  category: string;
  carrier: string;
  from: string;
  to: string;
  expected: string;
}

interface KiwiRouteRow {
  airline?: string;
  carrier?: string;
  route_from?: string;
  route_to?: string;
  from?: string;
  to?: string;
  flight_no?: string;
}

function routeKey(carrier: string, from: string, to: string): string {
  return `${carrier.toUpperCase()}-${from.toUpperCase()}-${to.toUpperCase()}`;
}

function loadKiwiRoutes(): Set<string> {
  const keys = new Set<string>();
  if (!existsSync(FIXTURE_DIR)) return keys;

  for (const file of readdirSync(FIXTURE_DIR)) {
    if (!file.startsWith("kiwi-routes-") || file === "kiwi-routes-summary.json") continue;
    if (file === "kiwi-endpoint-probe.json") continue;
    const raw = JSON.parse(readFileSync(join(FIXTURE_DIR, file), "utf-8")) as {
      body?: { data?: KiwiRouteRow[] };
      data?: KiwiRouteRow[];
      error?: string;
    };
    const rows = raw.body?.data ?? raw.data ?? [];
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      const carrier = String(row.airline ?? row.carrier ?? "").toUpperCase();
      const from = String(row.route_from ?? row.from ?? "").toUpperCase();
      const to = String(row.route_to ?? row.to ?? "").toUpperCase();
      if (carrier && from && to) keys.add(routeKey(carrier, from, to));
    }
  }
  return keys;
}

function winner(
  expected: string,
  inOf: boolean,
  inKiwi: boolean,
): "openflights" | "kiwi" | "both" | "neither" | "na" {
  if (expected === "operating-carrier-needed" || expected === "advisory-only") return "na";
  if (expected === "must-not-appear-active") {
    if (inOf && !inKiwi) return "kiwi";
    if (!inOf && inKiwi) return "openflights";
    if (inOf && inKiwi) return "neither";
    return "both";
  }
  if (expected === "should-appear") {
    if (inOf && inKiwi) return "both";
    if (inKiwi && !inOf) return "kiwi";
    if (inOf && !inKiwi) return "openflights";
    return "neither";
  }
  return "na";
}

function main(): void {
  const writeDoc = process.argv.includes("--write-doc");
  const corpus = JSON.parse(readFileSync(CORPUS_PATH, "utf-8")) as CorpusEntry[];
  const merged = loadOpenFlightsRoutes();
  const ofKeys = new Set(
    merged.filter((r) => !r.inactive).map((r) => routeKey(r.carrier, r.from, r.to)),
  );
  const kiwiKeys = loadKiwiRoutes();

  const rows = corpus.map((e) => {
    const key = routeKey(e.carrier, e.from, e.to);
    const inOf = ofKeys.has(key);
    const inKiwi = kiwiKeys.has(key);
    return {
      ...e,
      inOpenFlights: inOf,
      inKiwi,
      winner: winner(e.expected, inOf, inKiwi),
    };
  });

  const kiwiWins = rows.filter((r) => r.winner === "kiwi").length;
  const ofWins = rows.filter((r) => r.winner === "openflights").length;
  const both = rows.filter((r) => r.winner === "both").length;
  const neither = rows.filter((r) => r.winner === "neither").length;

  console.log("Route source comparison");
  console.log(`  OpenFlights keys: ${ofKeys.size}`);
  console.log(`  Kiwi keys: ${kiwiKeys.size}`);
  console.log(`  Both: ${both}, Kiwi-only wins: ${kiwiWins}, OF-only: ${ofWins}, neither: ${neither}`);

  if (!writeDoc) {
    console.log("Run with --write-doc to write docs/research/kiwi-benchmark-comparison.md");
    return;
  }

  let md = `# Kiwi vs OpenFlights benchmark comparison\n\n`;
  md += `Generated: ${new Date().toISOString().slice(0, 10)}\n\n`;
  md += `| Source | Route keys |\n|--------|------------|\n`;
  md += `| OpenFlights merged | ${ofKeys.size} |\n`;
  md += `| Kiwi fixtures | ${kiwiKeys.size} |\n\n`;
  md += `| Outcome | Count |\n|---------|-------|\n`;
  md += `| Both present | ${both} |\n| Kiwi-only better | ${kiwiWins} |\n| OpenFlights-only | ${ofWins} |\n| Neither | ${neither} |\n\n`;
  md += `| ID | Route | Expected | OF | Kiwi | Winner |\n|----|-------|----------|----|------|--------|\n`;
  for (const r of rows) {
    md += `| ${r.id} | ${r.carrier} ${r.from}→${r.to} | ${r.expected} | ${r.inOpenFlights ? "Y" : "N"} | ${r.inKiwi ? "Y" : "N"} | ${r.winner} |\n`;
  }
  writeFileSync(DOC_PATH, md, "utf-8");
  console.log(`Wrote ${DOC_PATH}`);
}

main();
