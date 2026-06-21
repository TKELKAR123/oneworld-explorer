/**
 * Build airport registry from OurAirports CSV (ODbL).
 * Usage: npm run build:airports
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { get } from "node:https";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = join(repoRoot, "data/vendor");
const csvPath = join(vendorDir, "ourairports-airports.csv");
const overridesPath = join(repoRoot, "data/airport-overrides.json");
const outPath = join(repoRoot, "data/airports.generated.json");

const OURAIRPORTS_URL =
  "https://davidmegginson.github.io/ourairports-data/airports.csv";

interface AirportOut {
  iata: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  usState?: string;
  caProvince?: string;
}

async function downloadCsv(): Promise<void> {
  if (existsSync(csvPath)) return;
  mkdirSync(vendorDir, { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const file = createWriteStream(csvPath);
    get(OURAIRPORTS_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", reject);
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  result.push(cur);
  return result;
}

async function parseAirports(): Promise<AirportOut[]> {
  const lines = readFileSync(csvPath, "utf-8").split("\n");
  let headers: string[] = [];
  const airports: AirportOut[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (headers.length === 0) {
      headers = cols;
      continue;
    }
    const row = Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""]));
    const iata = (row.iata_code as string).trim();
    if (!iata || iata.length !== 3) continue;
    if ((row.scheduled_service as string) !== "yes") continue;

    const country = (row.iso_country as string).trim().toUpperCase();
    const isoRegion = (row.iso_region as string).trim();
    const lat = parseFloat(row.latitude_deg as string);
    const lon = parseFloat(row.longitude_deg as string);

    const entry: AirportOut = {
      iata: iata.toUpperCase(),
      name: (row.name as string).trim(),
      city: ((row.municipality as string) || row.name).trim(),
      country,
      latitude: Number.isFinite(lat) ? lat : undefined,
      longitude: Number.isFinite(lon) ? lon : undefined,
    };

    if (country === "US" && isoRegion.startsWith("US-")) {
      entry.usState = isoRegion.slice(3);
    }
    if (country === "CA" && isoRegion.startsWith("CA-")) {
      entry.caProvince = isoRegion.slice(3);
    }

    airports.push(entry);
  }

  return airports;
}

function mergeOverrides(airports: AirportOut[]): AirportOut[] {
  if (!existsSync(overridesPath)) return airports;
  const overrides = JSON.parse(readFileSync(overridesPath, "utf-8")) as Record<
    string,
    Partial<AirportOut>
  >;
  const map = new Map(airports.map((a) => [a.iata, a]));
  for (const [iata, patch] of Object.entries(overrides)) {
    const key = iata.toUpperCase();
    const existing = map.get(key);
    if (existing) {
      map.set(key, { ...existing, ...patch, iata: key });
    } else {
      map.set(key, { iata: key, name: key, city: key, country: "XX", ...patch });
    }
  }
  return [...map.values()].sort((a, b) => a.iata.localeCompare(b.iata));
}

async function main() {
  await downloadCsv();
  const airports = mergeOverrides(await parseAirports());
  writeFileSync(outPath, JSON.stringify(airports, null, 2));
  console.log(`Wrote ${airports.length} airports to ${outPath}`);
  if (!airports.some((a) => a.iata === "TOS")) {
    console.warn("WARN: TOS not in output");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
