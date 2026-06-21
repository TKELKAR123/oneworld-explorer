#!/usr/bin/env npx tsx
/**
 * Spike Aviationstack + AeroDataBox for LHR→JFK and write redacted fixtures for CI.
 * Loads root `.env.local` then `apps/web/.env.local` (later overrides).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fetchAeroDataBoxFlights,
  fetchAviationstackFlights,
} from "../packages/schedules/src/index.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE_DIR = join(ROOT, "tests/schedules/fixtures");
const SPIKE = { from: "LHR", to: "JFK", date: "2026-09-15" };

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
    // optional env files
  }
}

function redact(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/access_key=[^&]+/gi, "access_key=REDACTED")
      .replace(/sk_[a-z0-9]+/gi, "REDACTED")
      .replace(/[a-f0-9]{32,}/gi, "REDACTED");
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (/key|token|secret|authorization/i.test(k)) {
        out[k] = "REDACTED";
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  }
  return value;
}

function writeFixture(name: string, data: unknown): void {
  mkdirSync(FIXTURE_DIR, { recursive: true });
  const path = join(FIXTURE_DIR, name);
  writeFileSync(path, `${JSON.stringify(redact(data), null, 2)}\n`, "utf-8");
  console.log(`Wrote ${path}`);
}

function syntheticAviationstackFixture() {
  return {
    data: [
      {
        flight_date: SPIKE.date,
        flight_status: "scheduled",
        departure: {
          iata: "LHR",
          terminal: "5",
          scheduled: `${SPIKE.date}T10:00:00+00:00`,
        },
        arrival: {
          iata: "JFK",
          terminal: "7",
          scheduled: `${SPIKE.date}T18:30:00+00:00`,
        },
        airline: { iata: "BA", name: "British Airways" },
        flight: { iata: "BA178", number: "178", codeshared: null },
      },
    ],
  };
}

function syntheticAeroDataBoxFixture() {
  return {
    departures: [
      {
        number: "BA 178",
        codeshareStatus: "IsOperator",
        airline: { iata: "BA", name: "British Airways" },
        operatingAirline: { iata: "BA", name: "British Airways" },
        departure: {
          airport: { iata: "LHR" },
          scheduledTime: { utc: `${SPIKE.date}T10:00:00Z` },
          terminal: "5",
        },
        arrival: {
          airport: { iata: "JFK" },
          scheduledTime: { utc: `${SPIKE.date}T18:30:00Z` },
          terminal: "7",
        },
      },
    ],
    route: SPIKE,
  };
}

async function main(): Promise<void> {
  loadEnvFile(join(ROOT, ".env.local"));
  loadEnvFile(join(ROOT, "apps/web/.env.local"));

  const hasAs = Boolean(process.env.AVIATIONSTACK_ACCESS_KEY);
  const hasAdb = Boolean(process.env.AERODATABOX_RAPIDAPI_KEY);
  console.log(`Spike ${SPIKE.from}→${SPIKE.to} on ${SPIKE.date}`);
  console.log(`Aviationstack key: ${hasAs ? "present" : "missing"}`);
  console.log(`AeroDataBox key: ${hasAdb ? "present" : "missing"}`);

  let asWritten = false;
  let adbWritten = false;

  if (hasAs) {
    try {
      const raw = await fetchAviationstackFlights(SPIKE);
      writeFixture("aviationstack-lhr-jfk.json", raw);
      asWritten = true;
    } catch (err) {
      console.error("Aviationstack spike failed:", err);
    }
  }

  if (hasAdb) {
    try {
      const raw = await fetchAeroDataBoxFlights(SPIKE);
      writeFixture("aerodatabox-lhr-jfk.json", raw);
      adbWritten = true;
    } catch (err) {
      console.error("AeroDataBox spike failed:", err);
    }
  }

  if (!asWritten) {
    console.warn("Writing synthetic Aviationstack fixture for CI.");
    writeFixture("aviationstack-lhr-jfk.json", syntheticAviationstackFixture());
  }

  if (!adbWritten) {
    console.warn("Writing synthetic AeroDataBox fixture for CI.");
    writeFixture("aerodatabox-lhr-jfk.json", syntheticAeroDataBoxFixture());
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
