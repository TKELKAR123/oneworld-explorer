import type { Airport, Continent, ValidationIssue } from "../../ontology/types.js";
import { CONTINENT_ZONE } from "../constants.js";
import { getCountryMapping } from "../../geography/resolve-airport.js";

const EXPLORER_CONTINENTS = new Set<Continent>([
  "europe-middle-east",
  "africa",
  "asia",
  "south-west-pacific",
  "north-america",
  "south-america",
]);

const PDF_EUROPE_COUNTRIES = new Set(["DZ", "MA", "TN"]);
const PDF_MIDDLE_EAST_COUNTRIES = new Set(["EG", "LY", "SD"]);
const PDF_ASIA_COUNTRIES = new Set(["KZ", "KG", "TJ", "TM", "UZ"]);

export function validateTcDefinition(points: Airport[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const p of points) {
    const expected = CONTINENT_ZONE[p.continent];
    if (p.zone !== expected) {
      issues.push({
        code: "R3015-0-tc-def",
        severity: "error",
        message: `${p.iata}: TC zone ${p.zone} does not match continent ${p.continent} (expected ${expected}).`,
        evidence: [`continent=${p.continent}`, `zone=${p.zone}`],
      });
    }
  }
  return issues;
}

export function validateContinentDefinition(points: Airport[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const p of points) {
    if (!EXPLORER_CONTINENTS.has(p.continent)) {
      issues.push({
        code: "R3015-0-continent-def",
        severity: "error",
        message: `${p.iata}: continent ${p.continent} is not a Rule 3015 Explorer continent.`,
      });
    }
  }
  return issues;
}

export function validateEuMeZones(points: Airport[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const p of points) {
    if (p.continent !== "europe-middle-east") continue;

    if (PDF_EUROPE_COUNTRIES.has(p.country) && p.subZone !== "europe") {
      issues.push({
        code: "R3015-0-eu-me-zones",
        severity: "error",
        message: `${p.iata} (${p.country}) must be Europe sub-zone per §0.`,
        evidence: [`subZone=${p.subZone ?? "none"}`],
      });
    }
    if (PDF_MIDDLE_EAST_COUNTRIES.has(p.country) && p.subZone !== "middle-east") {
      issues.push({
        code: "R3015-0-eu-me-zones",
        severity: "error",
        message: `${p.iata} (${p.country}) must be Middle East sub-zone per §0.`,
        evidence: [`subZone=${p.subZone ?? "none"}`],
      });
    }
    if (p.subZone && !["europe", "middle-east"].includes(p.subZone)) {
      issues.push({
        code: "R3015-0-eu-me-zones",
        severity: "error",
        message: `${p.iata}: invalid Europe-Middle East sub-zone ${p.subZone}.`,
      });
    }
  }
  return issues;
}

export function validateAsiaCountries(points: Airport[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const p of points) {
    if (PDF_ASIA_COUNTRIES.has(p.country) && p.continent !== "asia") {
      issues.push({
        code: "R3015-0-asia-countries",
        severity: "error",
        message: `${p.iata} (${p.country}) must map to Asia per §0.`,
        evidence: [`continent=${p.continent}`],
      });
    }
    if (p.country === "RU" && p.longitude !== undefined) {
      const expected: Continent =
        p.longitude >= 60 ? "asia" : "europe-middle-east";
      if (p.continent !== expected) {
        issues.push({
          code: "R3015-0-asia-countries",
          severity: "error",
          message: `${p.iata}: Russia east/west of Urals maps to ${expected}, got ${p.continent}.`,
        });
      }
    }
  }
  return issues;
}

export function validateNaIncludes(points: Airport[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const p of points) {
    const mapping = getCountryMapping(p.country);
    if (p.country === "PA" && p.continent !== "north-america") {
      issues.push({
        code: "R3015-0-na-includes",
        severity: "error",
        message: `${p.iata}: Panama must be North America per §0.`,
      });
    }
    if (
      mapping?.explorerContinent === "north-america" &&
      p.continent !== "north-america"
    ) {
      issues.push({
        code: "R3015-0-na-includes",
        severity: "error",
        message: `${p.iata} (${p.country}) must be North America per §0 geography.`,
      });
    }
  }
  return issues;
}
