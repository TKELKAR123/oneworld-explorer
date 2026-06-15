#!/usr/bin/env npx tsx
/**
 * Validates docs/geography/COUNTRY-MAP.json and data/COUNTRY-MAP.json:
 * - every ISO 3166-1 alpha-2 code appears exactly once per file
 * - required fields present
 * - trafficZone matches explorerContinent
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PATHS = [
  join(ROOT, "docs/geography/COUNTRY-MAP.json"),
  join(ROOT, "data/COUNTRY-MAP.json"),
];

const CONTINENT_TO_TC: Record<string, string> = {
  "north-america": "TC1",
  "south-america": "TC1",
  "europe-middle-east": "TC2",
  africa: "TC2",
  asia: "TC3",
  "south-west-pacific": "TC3",
};

const REQUIRED = ["iso", "explorerContinent", "trafficZone", "resolvedFrom"] as const;

function validateFile(path: string): string[] {
  const errors: string[] = [];
  const entries = JSON.parse(readFileSync(path, "utf8")) as Array<Record<string, string>>;
  const seen = new Set<string>();

  for (const entry of entries) {
    for (const field of REQUIRED) {
      if (!entry[field]) errors.push(`${path}: ${entry.iso ?? "?"} missing ${field}`);
    }
    if (!entry.iso || entry.iso.length !== 2) {
      errors.push(`${path}: invalid iso ${entry.iso}`);
      continue;
    }
    if (seen.has(entry.iso)) errors.push(`${path}: duplicate iso ${entry.iso}`);
    seen.add(entry.iso);

    const expectedTc = CONTINENT_TO_TC[entry.explorerContinent];
    if (expectedTc && entry.trafficZone !== expectedTc) {
      errors.push(
        `${path}: ${entry.iso} trafficZone ${entry.trafficZone} ≠ expected ${expectedTc}`,
      );
    }
  }

  return errors;
}

const allErrors = PATHS.flatMap(validateFile);
if (allErrors.length) {
  console.error("COUNTRY-MAP validation failed:\n" + allErrors.join("\n"));
  process.exit(1);
}
console.log(`COUNTRY-MAP OK (${PATHS.length} files, multi-source schema)`);
