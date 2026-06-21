#!/usr/bin/env npx tsx
/**
 * Score OpenFlights baseline against route-benchmark-corpus.json.
 * Usage: npx tsx scripts/score-route-benchmark.ts [--write-doc]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadOpenFlightsRoutes,
  loadRouteOverrides,
  isRouteInactive,
} from "../packages/schedules/src/openflights-routes.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const corpusPath = join(repoRoot, "data/fixtures/route-benchmark-corpus.json");
const adsbPath = join(repoRoot, "data/fixtures/adsb-routes-q1-2026.json");
const docPath = join(repoRoot, "docs/research/route-benchmark-baseline.md");

interface CorpusEntry {
  id: string;
  category: string;
  carrier: string;
  from: string;
  to: string;
  expected: string;
  note?: string;
}

interface ScoredRow {
  id: string;
  category: string;
  carrier: string;
  from: string;
  to: string;
  expected: string;
  inOpenFlights: boolean;
  inMerged: boolean;
  inactiveBlocked: boolean;
  adsbObserved: boolean;
  overrideMatch: boolean;
  verdict: "pass" | "fail" | "warn" | "na";
  detail: string;
}

function loadAdsb(): Set<string> {
  if (!existsSync(adsbPath)) return new Set();
  const rows = JSON.parse(readFileSync(adsbPath, "utf-8")) as Array<{
    carrier: string;
    from: string;
    to: string;
  }>;
  return new Set(rows.map((r) => `${r.carrier}-${r.from}-${r.to}`));
}

function routeKey(carrier: string, from: string, to: string): string {
  return `${carrier.toUpperCase()}-${from.toUpperCase()}-${to.toUpperCase()}`;
}

function scoreEntry(
  entry: CorpusEntry,
  indexOnly: Set<string>,
  merged: ReturnType<typeof loadOpenFlightsRoutes>,
  adsb: Set<string>,
): ScoredRow {
  const from = entry.from.toUpperCase();
  const to = entry.to.toUpperCase();
  const carrier = entry.carrier.toUpperCase();
  const key = routeKey(carrier, from, to);
  const inOpenFlights = indexOnly.has(key);
  const inMerged = merged.some(
    (r) => r.carrier === carrier && r.from === from && r.to === to && !r.inactive,
  );
  const inactiveBlocked = isRouteInactive(from, to);
  const adsbObserved = adsb.has(key);
  const overrideMatch = loadRouteOverrides().some(
    (r) => r.carrier === carrier && r.from === from && r.to === to,
  );

  let verdict: ScoredRow["verdict"] = "na";
  let detail = "";

  switch (entry.expected) {
    case "must-not-appear-active":
      if (inMerged && !inactiveBlocked) {
        verdict = "fail";
        detail = "Stale route still active in merged index";
      } else if (inactiveBlocked) {
        verdict = "pass";
        detail = "Correctly blocked by inactive override";
      } else if (!inMerged) {
        verdict = "pass";
        detail = "Not in merged index";
      }
      break;
    case "should-appear":
      if (inMerged || adsbObserved) {
        verdict = "pass";
        detail = inMerged ? "Present in merged index" : "ADS-B observed (override)";
      } else {
        verdict = "fail";
        detail = "Missing from merged index — recall gap";
      }
      break;
    case "may-appear-verify-dates":
      if (inMerged) {
        verdict = "warn";
        detail = "Present — seasonal; verify dates";
      } else {
        verdict = "warn";
        detail = "Absent — may be seasonal gap or stale negative";
      }
      break;
    case "verify-dates":
      verdict = inMerged ? "warn" : "warn";
      detail = inMerged
        ? "Present in stale index — may be false positive"
        : "Absent — inconclusive for seasonal";
      break;
    case "operating-carrier-needed":
      verdict = "na";
      detail = "Route pair index cannot resolve operating carrier — Tier 2 only";
      break;
    case "advisory-only":
      verdict = "na";
      detail = "Multi-hop advisory — direct index presence optional";
      break;
    default:
      detail = `Unknown expected: ${entry.expected}`;
  }

  return {
    id: entry.id,
    category: entry.category,
    carrier,
    from,
    to,
    expected: entry.expected,
    inOpenFlights,
    inMerged,
    inactiveBlocked,
    adsbObserved,
    overrideMatch,
    verdict,
    detail,
  };
}

function aggregateMetrics(rows: ScoredRow[]): {
  recall: number;
  falseActive: number;
  precisionProxy: number;
} {
  const shouldAppear = rows.filter((r) => r.expected === "should-appear");
  const recallHits = shouldAppear.filter((r) => r.verdict === "pass").length;
  const recall = shouldAppear.length ? recallHits / shouldAppear.length : 0;

  const mustNot = rows.filter((r) => r.expected === "must-not-appear-active");
  const falseActive = mustNot.filter((r) => r.verdict === "fail").length;
  const falseActiveRate = mustNot.length ? falseActive / mustNot.length : 0;

  const stalePresent = rows.filter(
    (r) =>
      r.expected === "must-not-appear-active" && r.inOpenFlights && !r.inactiveBlocked,
  ).length;
  const precisionProxy =
    mustNot.length > 0 ? 1 - falseActiveRate : 1 - stalePresent / Math.max(rows.length, 1);

  return { recall, falseActive: falseActiveRate, precisionProxy };
}

function renderDoc(rows: ScoredRow[], metrics: ReturnType<typeof aggregateMetrics>): string {
  const byCategory = new Map<string, ScoredRow[]>();
  for (const r of rows) {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  }

  let md = `# Route index benchmark\n\n`;
  md += `Generated: ${new Date().toISOString().slice(0, 10)}\n\n`;
  md += `Corpus: \`data/fixtures/route-benchmark-corpus.json\` (${rows.length} entries)\n\n`;
  md += `## Scorecard\n\n`;
  md += `| Metric | Value | Target (Method A) |\n`;
  md += `|--------|-------|-------------------|\n`;
  md += `| Recall (should-appear) | ${(metrics.recall * 100).toFixed(1)}% | ≥95% |\n`;
  md += `| False-active rate (must-not-appear) | ${(metrics.falseActive * 100).toFixed(1)}% | ≤2% |\n`;
  md += `| Precision proxy | ${(metrics.precisionProxy * 100).toFixed(1)}% | — |\n\n`;

  md += `## Summary by category\n\n`;
  for (const [cat, catRows] of byCategory) {
    const pass = catRows.filter((r) => r.verdict === "pass").length;
    const fail = catRows.filter((r) => r.verdict === "fail").length;
    const warn = catRows.filter((r) => r.verdict === "warn").length;
    md += `- **${cat}**: ${catRows.length} entries — pass ${pass}, fail ${fail}, warn ${warn}, na ${catRows.length - pass - fail - warn}\n`;
  }

  md += `\n## Detail\n\n`;
  md += `| ID | Cat | Route | Expected | OF | Merged | Verdict | Detail |\n`;
  md += `|----|-----|-------|----------|----|----|---------|--------|\n`;
  for (const r of rows) {
    md += `| ${r.id} | ${r.category} | ${r.carrier} ${r.from}→${r.to} | ${r.expected} | ${r.inOpenFlights ? "Y" : "N"} | ${r.inMerged ? "Y" : "N"} | ${r.verdict} | ${r.detail} |\n`;
  }

  md += `\n## Gaps identified\n\n`;
  const fails = rows.filter((r) => r.verdict === "fail");
  if (fails.length === 0) {
    md += `- No hard failures on \`should-appear\` / \`must-not-appear\` pairs.\n`;
  } else {
    for (const f of fails) {
      md += `- **${f.id}**: ${f.detail}\n`;
    }
  }

  const missingNewer = rows.filter(
    (r) => r.category === "newer-members" && r.expected === "should-appear" && r.verdict === "fail",
  );
  if (missingNewer.length > 0) {
    md += `\n### Newer-member recall gaps\n\n`;
    for (const m of missingNewer) {
      md += `- ${m.carrier} ${m.from}→${m.to}\n`;
    }
  }

  md += `\n## Method applicability\n\n`;
  md += `- **Route index (FlightsFrom weekly)**: Good trunk recall; ended routes need override blocklist when FlightsFrom lags.\n`;
  md += `- **Operating carrier (affiliate category)**: Not solvable at Tier 1 — requires Method B or user paste.\n`;
  md += `- **Multi-hop traps**: Expected advisory-only; hub BFS may still miss valid paths.\n`;

  return md;
}

function main(): void {
  const writeDoc = process.argv.includes("--write-doc");
  const quiet = process.argv.includes("--quiet");
  const minRecallArg = process.argv.find((a) => a.startsWith("--min-recall="));
  const minRecallIdx = process.argv.indexOf("--min-recall");
  const minRecall =
    minRecallArg != null
      ? Number(minRecallArg.split("=")[1])
      : minRecallIdx >= 0
        ? Number(process.argv[minRecallIdx + 1])
        : undefined;

  const corpus = JSON.parse(readFileSync(corpusPath, "utf-8")) as CorpusEntry[];

  const indexRaw = JSON.parse(
    readFileSync(join(repoRoot, "data/eligible-routes.index.json"), "utf-8"),
  ) as Array<{ carrier: string; from: string; to: string }>;
  const indexOnly = new Set(indexRaw.map((r) => routeKey(r.carrier, r.from, r.to)));

  const merged = loadOpenFlightsRoutes();
  const adsb = loadAdsb();

  const rows = corpus.map((e) => scoreEntry(e, indexOnly, merged, adsb));
  const metrics = aggregateMetrics(rows);

  if (!quiet) {
    console.log("Route index benchmark score");
    console.log(`  Corpus entries: ${rows.length}`);
    console.log(`  Recall (should-appear): ${(metrics.recall * 100).toFixed(1)}%`);
    console.log(`  False-active rate: ${(metrics.falseActive * 100).toFixed(1)}%`);
    console.log(`  Failures: ${rows.filter((r) => r.verdict === "fail").length}`);
  }

  if (minRecall != null && !Number.isNaN(minRecall) && metrics.recall * 100 < minRecall) {
    console.error(
      `Benchmark recall ${(metrics.recall * 100).toFixed(1)}% below minimum ${minRecall}%`,
    );
    process.exit(1);
  }

  const doc = renderDoc(rows, metrics);
  if (writeDoc) {
    writeFileSync(docPath, doc, "utf-8");
    if (!quiet) console.log(`Wrote ${docPath}`);
  } else if (!quiet) {
    console.log("\nRun with --write-doc to emit docs/research/route-benchmark-baseline.md");
  }
}

main();
