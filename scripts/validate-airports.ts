/**
 * Validates generated airport registry.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const airportsPath = join(repoRoot, "data/airports.generated.json");
const legacyPath = join(repoRoot, "data/airports.json");
const countryPath = join(repoRoot, "data/COUNTRY-MAP.json");

interface AirportEntry {
  iata: string;
  country: string;
}

const path = existsSync(airportsPath) ? airportsPath : legacyPath;
const airports = JSON.parse(readFileSync(path, "utf-8")) as AirportEntry[];
const countries = JSON.parse(readFileSync(countryPath, "utf-8")) as Array<{ iso: string }>;
const countrySet = new Set(countries.map((c) => c.iso));

const iataSet = new Set<string>();
let errors = 0;

for (const a of airports) {
  if (iataSet.has(a.iata)) {
    console.error(`Duplicate IATA: ${a.iata}`);
    errors++;
  }
  iataSet.add(a.iata);
  if (!countrySet.has(a.country)) {
    console.error(`Unknown country ${a.country} for ${a.iata}`);
    errors++;
  }
}

if (!iataSet.has("TOS")) {
  console.error("Missing TOS");
  errors++;
}

if (errors > 0) {
  console.error(`validate:airports failed (${errors} issues)`);
  process.exit(1);
}

console.log(`validate:airports OK (${airports.length} airports)`);
