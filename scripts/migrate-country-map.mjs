#!/usr/bin/env node
/**
 * One-time migration: single `source` field → multi-source `sources` object.
 * Applies Qantas agent guide transcription (2026-06-15 screenshots).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const QANTAS_GUIDE_URL =
  "https://www.qantas.com/content/dam/qac/oneworld-clue-cards/ow-rtw-continents.pdf";
const QANTAS_TRANSCRIBED_AT = "2026-06-15";

/** ISO → explorerContinent from Qantas ow-rtw-continents agent guide (screenshot transcription). */
const QANTAS_CONTINENT = {
  AF: "asia",
  AL: "europe-middle-east",
  DZ: "europe-middle-east",
  AS: "south-west-pacific",
  AO: "africa",
  AI: "north-america",
  AG: "north-america",
  AR: "south-america",
  AM: "europe-middle-east",
  AU: "south-west-pacific",
  AT: "europe-middle-east",
  AZ: "europe-middle-east",
  BS: "north-america",
  BH: "europe-middle-east",
  BD: "asia",
  BB: "north-america",
  BY: "europe-middle-east",
  BE: "europe-middle-east",
  BZ: "north-america",
  BJ: "africa",
  BM: "north-america",
  BT: "asia",
  BO: "south-america",
  BA: "europe-middle-east",
  BW: "africa",
  BR: "south-america",
  BN: "asia",
  BG: "europe-middle-east",
  BF: "africa",
  BI: "africa",
  KH: "asia",
  CM: "africa",
  CA: "north-america",
  CV: "africa",
  KY: "north-america",
  CF: "africa",
  TD: "africa",
  CL: "south-america",
  CN: "asia",
  CO: "south-america",
  KM: "africa",
  CG: "africa",
  CD: "africa",
  CK: "south-west-pacific",
  CR: "north-america",
  CI: "africa",
  HR: "europe-middle-east",
  CU: "north-america",
  CY: "europe-middle-east",
  CZ: "europe-middle-east",
  DK: "europe-middle-east",
  DJ: "africa",
  DM: "north-america",
  DO: "north-america",
  EC: "south-america",
  EG: "europe-middle-east",
  SV: "north-america",
  GQ: "africa",
  ER: "africa",
  EE: "europe-middle-east",
  ET: "africa",
  FK: "south-america",
  FJ: "south-west-pacific",
  FI: "europe-middle-east",
  FR: "europe-middle-east",
  GF: "south-america",
  PF: "south-west-pacific",
  GA: "africa",
  GM: "africa",
  GE: "europe-middle-east",
  DE: "europe-middle-east",
  GH: "africa",
  GI: "europe-middle-east",
  GR: "europe-middle-east",
  GD: "north-america",
  GP: "north-america",
  GU: "asia",
  GT: "north-america",
  GN: "africa",
  GW: "africa",
  GY: "south-america",
  HT: "north-america",
  HN: "north-america",
  HK: "asia",
  HU: "europe-middle-east",
  IS: "europe-middle-east",
  IN: "asia",
  ID: "asia",
  IR: "europe-middle-east",
  IQ: "europe-middle-east",
  IE: "europe-middle-east",
  IL: "europe-middle-east",
  IT: "europe-middle-east",
  JM: "north-america",
  JP: "asia",
  JO: "europe-middle-east",
  KZ: "asia",
  KE: "africa",
  KI: "south-west-pacific",
  KW: "europe-middle-east",
  KG: "asia",
  LA: "asia",
  LV: "europe-middle-east",
  LB: "europe-middle-east",
  LS: "africa",
  LR: "africa",
  LY: "europe-middle-east",
  LT: "europe-middle-east",
  LU: "europe-middle-east",
  MO: "asia",
  MK: "europe-middle-east",
  MG: "africa",
  MW: "africa",
  MY: "asia",
  MV: "asia",
  ML: "africa",
  MT: "europe-middle-east",
  MH: "asia",
  MQ: "north-america",
  MR: "africa",
  MU: "africa",
  YT: "africa",
  MX: "north-america",
  FM: "asia",
  MD: "europe-middle-east",
  MN: "asia",
  ME: "europe-middle-east",
  MS: "north-america",
  MA: "europe-middle-east",
  MZ: "africa",
  MM: "asia",
  NA: "africa",
  NR: "south-west-pacific",
  NP: "asia",
  NL: "europe-middle-east",
  NC: "south-west-pacific",
  NZ: "south-west-pacific",
  NI: "north-america",
  NE: "africa",
  NG: "africa",
  NU: "south-west-pacific",
  NF: "south-west-pacific",
  MP: "asia",
  NO: "europe-middle-east",
  OM: "europe-middle-east",
  PK: "asia",
  PW: "asia",
  PA: "north-america",
  PG: "south-west-pacific",
  PY: "south-america",
  PE: "south-america",
  PH: "asia",
  PL: "europe-middle-east",
  PT: "europe-middle-east",
  QA: "europe-middle-east",
  RE: "africa",
  RO: "europe-middle-east",
  RU: "europe-middle-east",
  WS: "south-west-pacific",
  ST: "africa",
  SA: "europe-middle-east",
  SN: "africa",
  RS: "europe-middle-east",
  SC: "africa",
  SL: "africa",
  SG: "asia",
  SK: "europe-middle-east",
  SI: "europe-middle-east",
  SB: "south-west-pacific",
  SO: "africa",
  ZA: "africa",
  ES: "europe-middle-east",
  LK: "asia",
  LC: "north-america",
  VC: "north-america",
  KN: "north-america",
  KR: "asia",
  SD: "europe-middle-east",
  SR: "south-america",
  SZ: "africa",
  SE: "europe-middle-east",
  CH: "europe-middle-east",
  SY: "europe-middle-east",
  TW: "asia",
  TJ: "asia",
  TZ: "africa",
  TH: "asia",
  TL: "asia",
  TG: "africa",
  TO: "south-west-pacific",
  TT: "north-america",
  TN: "europe-middle-east",
  TR: "europe-middle-east",
  TM: "asia",
  TC: "north-america",
  TV: "south-west-pacific",
  UG: "africa",
  UA: "europe-middle-east",
  AE: "europe-middle-east",
  GB: "europe-middle-east",
  UY: "south-america",
  US: "north-america",
  UZ: "asia",
  VU: "south-west-pacific",
  VE: "south-america",
  VN: "asia",
  VG: "north-america",
  VI: "north-america",
  WF: "south-west-pacific",
  YE: "europe-middle-east",
  ZM: "africa",
  ZW: "africa",
};

/** Dissolved Netherlands Antilles — Qantas lists as North America. */
const NETHERLANDS_ANTILLES_SUCCESSORS = ["AW", "BQ", "CW", "SX"];

/** Explicitly covered by a parenthetical in the Qantas USA row. */
const QANTAS_DERIVED = {
  PR: {
    explorerContinent: "north-america",
    regionLabel: "North America",
    derivedFrom: "USA (including Alaska, Hawaii & Puerto Rico)",
  },
};

const CONTINENT_LABEL = {
  "europe-middle-east": "Europe-Middle East",
  "south-west-pacific": "South West Pacific",
  "north-america": "North America",
  "south-america": "South America",
  asia: "Asia",
  africa: "Africa",
};

const RULE3015_EXPLICIT = new Set([
  "DZ",
  "MA",
  "TN",
  "EG",
  "LY",
  "SD",
  "RU",
  "KZ",
  "KG",
  "TJ",
  "TM",
  "UZ",
  "PA",
]);

const RULE3015_SUBZONE = {
  DZ: "europe",
  MA: "europe",
  TN: "europe",
  EG: "middle-east",
  LY: "middle-east",
  SD: "middle-east",
  RU: "europe",
};

function qantasContinent(iso) {
  if (QANTAS_CONTINENT[iso]) return QANTAS_CONTINENT[iso];
  if (QANTAS_DERIVED[iso]) return QANTAS_DERIVED[iso].explorerContinent;
  if (NETHERLANDS_ANTILLES_SUCCESSORS.includes(iso)) return "north-america";
  return undefined;
}

function qantasGuideSource(iso, continent) {
  if (QANTAS_DERIVED[iso]) {
    return {
      explorerContinent: continent,
      regionLabel: QANTAS_DERIVED[iso].regionLabel,
      guideUrl: QANTAS_GUIDE_URL,
      guideVersion: "undated",
      transcribedAt: QANTAS_TRANSCRIBED_AT,
      derivedFrom: QANTAS_DERIVED[iso].derivedFrom,
    };
  }
  return {
    explorerContinent: continent,
    regionLabel: CONTINENT_LABEL[continent],
    guideUrl: QANTAS_GUIDE_URL,
    guideVersion: "undated",
    transcribedAt: QANTAS_TRANSCRIBED_AT,
  };
}

function buildEntry(old) {
  const iso = old.iso;
  const qantas = qantasContinent(iso);
  const isRule3015 = RULE3015_EXPLICIT.has(iso) || old.source === "pdf-explicit";

  const sources = {
    iata: { trafficZone: old.trafficZone },
  };

  if (isRule3015) {
    sources.rule3015 = {
      explorerContinent: old.explorerContinent,
      explorerSubZone: old.explorerSubZone ?? null,
      citation: "oneworld Rule 3015 / Explorer PDF (27 Feb 2026)",
    };
  }

  if (qantas) {
    sources.qantasGuide = qantasGuideSource(iso, qantas);
  }

  let explorerContinent = old.explorerContinent;
  let explorerSubZone = old.explorerSubZone ?? null;
  let resolvedFrom = "geography";

  if (isRule3015) {
    explorerContinent = sources.rule3015.explorerContinent;
    explorerSubZone =
      RULE3015_SUBZONE[iso] ?? sources.rule3015.explorerSubZone ?? null;
    resolvedFrom = "rule3015";
  } else if (qantas) {
    explorerContinent = qantas;
    resolvedFrom = "qantasGuide";
    if (explorerContinent === "europe-middle-east" && explorerSubZone == null) {
      explorerSubZone = old.explorerSubZone ?? null;
    } else if (explorerContinent !== "europe-middle-east") {
      explorerSubZone = null;
    }
  } else if (old.source === "iata-inferred") {
    resolvedFrom = "iata";
  }

  const conflicts = [];

  if (qantas && isRule3015 && qantas !== sources.rule3015.explorerContinent) {
    conflicts.push({
      field: "explorerContinent",
      values: {
        rule3015: sources.rule3015.explorerContinent,
        qantasGuide: qantas,
      },
      note: "Rule 3015 named exception takes precedence over Qantas guide.",
    });
  }

  if (
    qantas &&
    old.source === "flyertalk" &&
    old.explorerContinent !== qantas
  ) {
    conflicts.push({
      field: "explorerContinent",
      values: {
        priorInference: old.explorerContinent,
        qantasGuide: qantas,
      },
      note: "Prior community inference superseded by Qantas agent guide.",
    });
  }

  if (
    qantas &&
    !isRule3015 &&
    old.source === "iata-inferred" &&
    old.explorerContinent !== qantas
  ) {
    conflicts.push({
      field: "explorerContinent",
      values: {
        iataInferred: old.explorerContinent,
        qantasGuide: qantas,
      },
      note: "IATA TC geography differs from Qantas Explorer continent assignment.",
    });
  }

  let notes = old.notes ?? "";
  notes = notes.replace(/FlyerTalk\/oneworld practice:?\s*/gi, "");
  notes = notes.replace(/FlyerTalk[^.]*\.?\s*/gi, "").trim();

  if (qantas && ["GU", "MH", "FM", "MP", "PW"].includes(iso)) {
    const extra =
      "Qantas guide lists under Asia (not South West Pacific); Micronesia bloc treated as Asia.";
    notes = notes ? `${notes} ${extra}` : extra;
  }

  if (!qantas && !NETHERLANDS_ANTILLES_SUCCESSORS.includes(iso)) {
    const extra =
      "Not listed in Qantas continent guide; resolved via IATA TC / geographic inference.";
    if (!notes.includes("Not listed in Qantas")) {
      notes = notes ? `${notes} ${extra}` : extra;
    }
  }

  if (NETHERLANDS_ANTILLES_SUCCESSORS.includes(iso)) {
    const extra =
      "Successor to Netherlands Antilles (Qantas: North America).";
    notes = notes ? `${notes} ${extra}` : extra;
  }

  if (QANTAS_DERIVED[iso]) {
    const extra = `Covered under "${QANTAS_DERIVED[iso].derivedFrom}" in Qantas guide.`;
    notes = notes ? `${notes} ${extra}` : extra;
  }

  const entry = {
    iso,
    explorerContinent,
    explorerSubZone,
    trafficZone: old.trafficZone,
    sources,
    resolvedFrom,
  };

  if (conflicts.length > 0) entry.conflicts = conflicts;
  if (notes) entry.notes = notes;

  return entry;
}

const inputPath = join(root, "data/COUNTRY-MAP.json");
const oldEntries = JSON.parse(readFileSync(inputPath, "utf-8"));
const newEntries = oldEntries.map(buildEntry);

const qantasUpdated = newEntries.filter((e) => e.sources.qantasGuide).length;
const continentChanged = newEntries.filter(
  (e, i) => e.explorerContinent !== oldEntries[i].explorerContinent,
).length;
const notInQantas = newEntries.filter((e) => !e.sources.qantasGuide).map((e) => e.iso);

writeFileSync(inputPath, `${JSON.stringify(newEntries, null, 2)}\n`);
writeFileSync(
  join(root, "docs/geography/COUNTRY-MAP.json"),
  `${JSON.stringify(newEntries, null, 2)}\n`,
);

console.log(JSON.stringify({ qantasUpdated, continentChanged, notInQantas, notInQantasCount: notInQantas.length }, null, 2));
