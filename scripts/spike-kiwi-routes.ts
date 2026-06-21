#!/usr/bin/env npx tsx
/**
 * Spike Kiwi Tequila static routes claim: GET /data/routes?airline={IATA}
 * Writes redacted fixtures to tests/schedules/fixtures/kiwi-routes-{carrier}.json
 * Usage: npx tsx scripts/spike-kiwi-routes.ts [--probe-only] [--carrier BA]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE_DIR = join(ROOT, "tests/schedules/fixtures");
const REGISTRY_PATH = join(ROOT, "data/CARRIER-REGISTRY.json");
const PROBE_LOG_PATH = join(FIXTURE_DIR, "kiwi-endpoint-probe.json");

const TEQUILA_BASE = "https://api.tequila.kiwi.com";
const PROBE_PATHS = [
  "/data/routes?airline=BA",
  "/routes?airline=BA",
  "/v2/routes?airline=BA",
  "/data/airlines",
  "/locations/query?term=BA&location_types=airline",
];

interface ProbeResult {
  path: string;
  status: number;
  ok: boolean;
  contentType: string | null;
  bodyPreview: string;
  rateLimitRemaining: string | null;
}

function loadEnvFile(path: string): void {
  try {
    const text = readFileSync(path, "utf-8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

function redact(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/[a-f0-9]{20,}/gi, "REDACTED").replace(/apikey=[^&]+/gi, "apikey=REDACTED");
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = /key|token|secret|authorization/i.test(k) ? "REDACTED" : redact(v);
    }
    return out;
  }
  return value;
}

function eligibleCarriers(): string[] {
  const reg = JSON.parse(readFileSync(REGISTRY_PATH, "utf-8")) as {
    eligible: Array<{ iata: string }>;
  };
  return reg.eligible.map((c) => c.iata.toUpperCase());
}

async function probeEndpoint(path: string, apiKey: string): Promise<ProbeResult> {
  const url = `${TEQUILA_BASE}${path}`;
  const res = await fetch(url, { headers: { apikey: apiKey } });
  const text = await res.text();
  return {
    path,
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get("content-type"),
    bodyPreview: text.slice(0, 400),
    rateLimitRemaining: res.headers.get("x-ratelimit-remaining"),
  };
}

async function fetchDataRoutes(carrier: string, apiKey: string): Promise<{
  status: number;
  data: unknown;
  headers: Record<string, string>;
}> {
  const url = `${TEQUILA_BASE}/data/routes?airline=${carrier}`;
  const res = await fetch(url, { headers: { apikey: apiKey } });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 2000) };
  }
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => {
    headers[k] = v;
  });
  return { status: res.status, data, headers };
}

function summarizeKiwiPayload(data: unknown): {
  rowCount: number;
  sampleFields: string[];
  uniqueOdPairs: number;
  hasFlightNo: boolean;
  hasOperatingCarrier: boolean;
} {
  const empty = {
    rowCount: 0,
    sampleFields: [],
    uniqueOdPairs: 0,
    hasFlightNo: false,
    hasOperatingCarrier: false,
  };
  if (!data || typeof data !== "object") return empty;
  const obj = data as Record<string, unknown>;
  const rows = Array.isArray(obj.data) ? obj.data : Array.isArray(data) ? data : [];
  if (!Array.isArray(rows) || rows.length === 0) return empty;

  const sample = rows[0] as Record<string, unknown>;
  const sampleFields = Object.keys(sample);
  const od = new Set<string>();
  let hasFlightNo = false;
  let hasOperatingCarrier = false;

  for (const row of rows) {
    const r = row as Record<string, unknown>;
    const from = String(r.route_from ?? r.from ?? r.departure ?? "").toUpperCase();
    const to = String(r.route_to ?? r.to ?? r.arrival ?? "").toUpperCase();
    if (from && to) od.add(`${from}-${to}`);
    if (r.flight_no ?? r.flight_number ?? r.flightNo) hasFlightNo = true;
    if (r.operating_carrier ?? r.operating_airline ?? r.operatingCarrier) hasOperatingCarrier = true;
  }

  return {
    rowCount: rows.length,
    sampleFields,
    uniqueOdPairs: od.size,
    hasFlightNo,
    hasOperatingCarrier,
  };
}

function writeFixture(name: string, data: unknown): void {
  mkdirSync(FIXTURE_DIR, { recursive: true });
  const path = join(FIXTURE_DIR, name);
  writeFileSync(path, `${JSON.stringify(redact(data), null, 2)}\n`, "utf-8");
  console.log(`Wrote ${path}`);
}

async function main(): Promise<void> {
  loadEnvFile(join(ROOT, ".env.local"));
  loadEnvFile(join(ROOT, "apps/web/.env.local"));

  const probeOnly = process.argv.includes("--probe-only");
  const carrierArg = process.argv.find((a) => a.startsWith("--carrier="))?.split("=")[1]?.toUpperCase();
  const apiKey = process.env.KIWI_TEQUILA_API_KEY ?? "MISSING";

  console.log(`Kiwi Tequila spike — key: ${apiKey === "MISSING" ? "missing" : "present"}`);

  const probes: ProbeResult[] = [];
  for (const path of PROBE_PATHS) {
    const result = await probeEndpoint(path, apiKey === "MISSING" ? "test" : apiKey);
    probes.push(result);
    console.log(`  PROBE ${result.status} ${path}`);
  }
  writeFixture("kiwi-endpoint-probe.json", {
    probedAt: new Date().toISOString(),
    apiKeyPresent: apiKey !== "MISSING",
    results: probes,
  });

  if (probeOnly) return;

  const carriers = carrierArg ? [carrierArg] : eligibleCarriers();
  const summaries: Array<{
    carrier: string;
    status: number;
    summary: ReturnType<typeof summarizeKiwiPayload>;
  }> = [];

  for (const carrier of carriers) {
    if (apiKey === "MISSING") {
      writeFixture(`kiwi-routes-${carrier}.json`, {
        error: "KIWI_TEQUILA_API_KEY not set",
        endpoint: `/data/routes?airline=${carrier}`,
        note: "Endpoint returned 404 in unauthenticated probe — see kiwi-endpoint-probe.json",
      });
      summaries.push({ carrier, status: 0, summary: summarizeKiwiPayload(null) });
      continue;
    }

    const { status, data, headers } = await fetchDataRoutes(carrier, apiKey);
    writeFixture(`kiwi-routes-${carrier}.json`, { status, headers, body: data });
    const summary = summarizeKiwiPayload(data);
    summaries.push({ carrier, status, summary });
    console.log(
      `  ${carrier}: HTTP ${status} — ${summary.rowCount} rows, ${summary.uniqueOdPairs} OD pairs`,
    );
    await new Promise((r) => setTimeout(r, 200));
  }

  writeFixture("kiwi-routes-summary.json", {
    fetchedAt: new Date().toISOString(),
    carriers: summaries,
    eligibleCount: carriers.length,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
