/**
 * Generates tests/scenarios/catalog.json and docs/scenarios/SCENARIO-CATALOG.md
 * Run: npx tsx scripts/generate-scenario-catalog.ts
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateRoute } from "../packages/core/dist/index.js";
import type { RouteSegment, TravelClass, ValidationOutcome } from "../packages/core/dist/index.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURES_DIR = join(ROOT, "tests/scenarios/fixtures");
const CATALOG_PATH = join(ROOT, "tests/scenarios/catalog.json");
const DOC_PATH = join(ROOT, "docs/scenarios/SCENARIO-CATALOG.md");

const ALL_V01_RULES = readFileSync(join(ROOT, "docs/rules/R3015-formal.yaml"), "utf8")
  .split(/^  - id: /m)
  .slice(1)
  .filter((block) => /enforceInV01: true/.test(block))
  .map((block) => block.match(/^(R3015-[^\n]+)/)![1]);

const CLASSIC_RTW: RouteSegment[] = [
  { from: "JFK", to: "LHR" },
  { from: "LHR", to: "DXB" },
  { from: "DXB", to: "SIN" },
  { from: "SIN", to: "SYD" },
  { from: "SYD", to: "LAX" },
  { from: "LAX", to: "JFK" },
];

interface Taxonomy {
  journeyShape?: string;
  originMarket?: string;
  fareClass?: string;
  dataRichness?: string;
  failureCluster?: string;
}

interface CatalogScenario {
  id: string;
  source: string;
  tags?: string[];
  taxonomy?: Taxonomy;
  travelClass?: TravelClass;
  segments: RouteSegment[];
  ticket?: {
    purchasedBeforeDeparture?: boolean;
    validatingCarrier?: string;
    saleMarket?: string;
    reservationDate?: string;
    ticketingCompleteDate?: string;
    pnrHasOsiRtw?: boolean;
  };
  expectValid: boolean;
  expectOutcome?: ValidationOutcome;
  expectRuleIds?: string[];
  expectIssueCodes?: string[];
  expectOriginReturnMode?: string;
  expectActiveRules?: string[];
  expectNotApplicableRules?: string[];
  minPassedRules?: number;
  rulesTouched?: string[];
}

function loadFixtures(): CatalogScenario[] {
  return readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(FIXTURES_DIR, f), "utf8")) as CatalogScenario)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function enrichFixture(s: CatalogScenario): CatalogScenario {
  const base: CatalogScenario = { ...s };
  if (!base.tags) {
    if (s.id === "SC-006") base.tags = ["smoke-api", "geometry-only"];
    else if (["SC-001", "SC-009", "SC-015"].includes(s.id)) base.tags = ["smoke-api", "smoke-ui", "geometry-only"];
    else if (s.id.startsWith("SC-01") && Number(s.id.slice(3)) >= 5) base.tags = ["open-jaw", "geometry-only"];
    else base.tags = ["geometry-only"];
  }
  if (!base.rulesTouched) {
    base.rulesTouched = inferRulesTouched(s);
  }
  if (!base.taxonomy) {
    base.taxonomy = {
      journeyShape: inferJourneyShape(s),
      dataRichness: "geometry-only",
      failureCluster: s.expectRuleIds?.[0] ?? s.expectIssueCodes?.[0],
    };
  }
  return base;
}

function inferJourneyShape(s: CatalogScenario): string {
  if (s.expectOriginReturnMode === "openJaw" || s.expectOriginReturnMode === "openJawPending") return "open-jaw";
  if (s.expectOriginReturnMode === "closedLoop") return "closed-loop";
  if (s.segments.length <= 3) return "short-haul";
  return "classic-rtw";
}

function inferRulesTouched(s: CatalogScenario): string[] {
  const touched = new Set<string>(s.expectRuleIds ?? s.expectIssueCodes ?? []);
  if (s.expectActiveRules) for (const r of s.expectActiveRules) touched.add(r);
  if (s.expectNotApplicableRules) for (const r of s.expectNotApplicableRules) touched.add(r);
  if (s.expectValid) {
    touched.add("R3015-4a");
    touched.add("R3015-4b-direction");
    touched.add("R3015-4c-origin");
    touched.add("R3015-0-continent-count");
    touched.add("R3015-0-fare-basis");
  }
  if (touched.size === 0 && s.id === "SC-006") touched.add("UNKNOWN_AIRPORT");
  return [...touched];
}

const GAP_AND_NEW: CatalogScenario[] = [
  {
    id: "SC-012",
    source: "HKG–China open jaw via surface (§4c-d)",
    tags: ["open-jaw", "geometry-only"],
    taxonomy: { journeyShape: "open-jaw", dataRichness: "geometry-only" },
    segments: [
      { from: "HKG", to: "PEK", surface: true },
      { from: "PEK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "PEK" },
    ],
    expectValid: false,
    expectOriginReturnMode: "openJaw",
    expectActiveRules: ["R3015-4c-open-jaw-d", "R3015-4c-origin"],
    rulesTouched: ["R3015-4c-open-jaw-d", "R3015-4c-origin", "R3015-4a"],
  },
  {
    id: "SC-013",
    source: "India–Maldives open jaw MAA→MLE (§4c-g) — direction fail",
    tags: ["open-jaw", "geometry-only"],
    taxonomy: { journeyShape: "open-jaw", dataRichness: "geometry-only", failureCluster: "direction" },
    segments: [
      { from: "MAA", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "LAX" },
      { from: "LAX", to: "SYD" },
      { from: "SYD", to: "MLE" },
    ],
    expectValid: false,
    expectOriginReturnMode: "openJaw",
    expectActiveRules: ["R3015-4c-open-jaw-g", "R3015-4c-origin"],
    expectRuleIds: ["R3015-4b-direction"],
    rulesTouched: ["R3015-4c-open-jaw-g", "R3015-4c-origin", "R3015-4b-direction"],
  },
  {
    id: "SC-026",
    source: "Ineligible carrier UA on first sector",
    tags: ["carriers", "smoke-api"],
    taxonomy: { dataRichness: "carrier", failureCluster: "carrier-eligibility" },
    segments: [{ ...CLASSIC_RTW[0]!, marketingCarrier: "UA", operatingCarrier: "UA" }, ...CLASSIC_RTW.slice(1)],
    expectValid: false,
    expectRuleIds: ["R3015-4-carriers"],
    rulesTouched: ["R3015-4-carriers", "R3015-4j-codeshare"],
  },
  {
    id: "SC-027",
    source: "Valid BA/AA eligible-on-eligible codeshare",
    tags: ["carriers", "smoke-api"],
    taxonomy: { dataRichness: "carrier" },
    segments: [{ ...CLASSIC_RTW[0]!, marketingCarrier: "BA", operatingCarrier: "AA" }, ...CLASSIC_RTW.slice(1)],
    expectValid: true,
    rulesTouched: ["R3015-4-carriers", "R3015-4j-codeshare"],
  },
  {
    id: "SC-028",
    source: "Valid QF/JQ codeshare exception",
    tags: ["carriers", "smoke-api"],
    taxonomy: { dataRichness: "carrier" },
    segments: [{ ...CLASSIC_RTW[0]!, marketingCarrier: "QF", operatingCarrier: "JQ" }, ...CLASSIC_RTW.slice(1)],
    expectValid: true,
    rulesTouched: ["R3015-4j-codeshare", "R3015-4j-jq-qq"],
  },
  {
    id: "SC-029",
    source: "Invalid BA/JQ codeshare — not a permitted pair",
    tags: ["carriers"],
    taxonomy: { dataRichness: "carrier", failureCluster: "codeshare" },
    segments: [{ ...CLASSIC_RTW[0]!, marketingCarrier: "BA", operatingCarrier: "JQ" }, ...CLASSIC_RTW.slice(1)],
    expectValid: false,
    expectRuleIds: ["R3015-4j-codeshare"],
    rulesTouched: ["R3015-4j-codeshare"],
  },
  {
    id: "SC-030",
    source: "Valid AA/MQ American Eagle affiliate",
    tags: ["carriers"],
    taxonomy: { dataRichness: "carrier" },
    segments: [{ ...CLASSIC_RTW[0]!, marketingCarrier: "AA", operatingCarrier: "MQ" }, ...CLASSIC_RTW.slice(1)],
    expectValid: true,
    rulesTouched: ["R3015-4-affiliates", "R3015-4j-codeshare"],
  },
  {
    id: "SC-031",
    source: "NU validating carrier — not on §15 stock list",
    tags: ["ticket", "smoke-api"],
    taxonomy: { dataRichness: "ticket", failureCluster: "ticketing-stock" },
    segments: CLASSIC_RTW,
    ticket: { validatingCarrier: "NU" },
    expectValid: false,
    expectRuleIds: ["R3015-15-stock"],
    rulesTouched: ["R3015-15-stock"],
  },
  {
    id: "SC-032",
    source: "BA validating carrier on §15 stock list",
    tags: ["ticket", "smoke-api"],
    taxonomy: { dataRichness: "ticket" },
    segments: CLASSIC_RTW,
    ticket: { validatingCarrier: "BA", pnrHasOsiRtw: true },
    expectValid: true,
    rulesTouched: ["R3015-15-stock", "R3015-5-reservations"],
  },
  {
    id: "SC-033",
    source: "IB stock with QF/JQ segment — §15 exception",
    tags: ["ticket", "carriers"],
    taxonomy: { dataRichness: "ticket+carrier", failureCluster: "ticketing-stock" },
    segments: [{ ...CLASSIC_RTW[0]!, marketingCarrier: "QF", operatingCarrier: "JQ" }, ...CLASSIC_RTW.slice(1)],
    ticket: { validatingCarrier: "IB" },
    expectValid: false,
    expectRuleIds: ["R3015-15-stock-jq"],
    rulesTouched: ["R3015-15-stock-jq", "R3015-4j-jq-qq"],
  },
  {
    id: "SC-034",
    source: "Ticket not purchased before departure",
    tags: ["ticket", "compliance"],
    taxonomy: { dataRichness: "ticket", failureCluster: "purchase-timing" },
    segments: CLASSIC_RTW,
    ticket: { purchasedBeforeDeparture: false },
    expectValid: false,
    expectRuleIds: ["R3015-0-purchase"],
    rulesTouched: ["R3015-0-purchase"],
  },
  {
    id: "SC-035",
    source: "TC1 origin min stay — last intl sector under 10 days",
    tags: ["schedule", "smoke-api"],
    taxonomy: { originMarket: "TC1", dataRichness: "schedule", failureCluster: "min-stay" },
    segments: CLASSIC_RTW.map((s, i) => ({
      ...s,
      departureTime: i === 0 ? "2026-06-01T10:00:00Z" : i === 4 ? "2026-06-05T10:00:00Z" : undefined,
    })),
    expectValid: false,
    expectRuleIds: ["R3015-6-min-stay"],
    rulesTouched: ["R3015-6-min-stay"],
  },
  {
    id: "SC-036",
    source: "TC1 origin min stay — 10+ days between first and last intl sector",
    tags: ["schedule"],
    taxonomy: { originMarket: "TC1", dataRichness: "schedule" },
    segments: CLASSIC_RTW.map((s, i) => ({
      ...s,
      departureTime:
        i === 0 ? "2026-06-01T10:00:00Z" : i === 1 ? "2026-06-04T10:00:00Z" : i === 2 ? "2026-06-08T10:00:00Z" : i === 4 ? "2026-06-20T10:00:00Z" : undefined,
      arrivalTime: i === 0 ? "2026-06-02T10:00:00Z" : i === 1 ? "2026-06-05T10:00:00Z" : undefined,
    })),
    expectValid: true,
    rulesTouched: ["R3015-6-min-stay", "R3015-8-stopovers"],
  },
  {
    id: "SC-037",
    source: "Max stay exceeded — return over 12 months from origin",
    tags: ["schedule", "smoke-api"],
    taxonomy: { dataRichness: "schedule", failureCluster: "max-stay" },
    segments: CLASSIC_RTW.map((s, i) => ({
      ...s,
      departureTime: i === 0 ? "2026-01-01T10:00:00Z" : i === 5 ? "2027-02-01T10:00:00Z" : undefined,
      arrivalTime: i === 4 ? "2027-02-01T10:00:00Z" : undefined,
    })),
    expectValid: false,
    expectRuleIds: ["R3015-7-max-stay"],
    rulesTouched: ["R3015-7-max-stay"],
  },
  {
    id: "SC-038",
    source: "Fewer than 2 stopovers (24h+ connections)",
    tags: ["schedule"],
    taxonomy: { dataRichness: "schedule", failureCluster: "stopovers" },
    segments: CLASSIC_RTW.map((s, i) => ({
      ...s,
      departureTime: i === 0 ? "2026-06-01T10:00:00Z" : i === 1 ? "2026-06-04T10:00:00Z" : undefined,
      arrivalTime: i === 0 ? "2026-06-02T10:00:00Z" : undefined,
    })),
    expectValid: false,
    expectRuleIds: ["R3015-8-stopovers"],
    rulesTouched: ["R3015-8-stopovers"],
  },
  {
    id: "SC-039",
    source: "Minimum 2 stopovers satisfied",
    tags: ["schedule"],
    taxonomy: { dataRichness: "schedule" },
    segments: CLASSIC_RTW.map((s, i) => ({
      ...s,
      departureTime:
        i === 0 ? "2026-06-01T10:00:00Z" : i === 1 ? "2026-06-04T10:00:00Z" : i === 2 ? "2026-06-08T10:00:00Z" : undefined,
      arrivalTime: i === 0 ? "2026-06-02T10:00:00Z" : i === 1 ? "2026-06-05T10:00:00Z" : undefined,
    })),
    expectValid: true,
    rulesTouched: ["R3015-8-stopovers"],
  },
  {
    id: "SC-040",
    source: "Invalid RBD X on AA economy sector",
    tags: ["ticket", "compliance"],
    taxonomy: { dataRichness: "ticket+rbd", failureCluster: "booking-class" },
    segments: [{ ...CLASSIC_RTW[0]!, marketingCarrier: "AA", rbd: "X" }, ...CLASSIC_RTW.slice(1)],
    expectValid: false,
    expectRuleIds: ["R3015-5b-booking"],
    rulesTouched: ["R3015-5b-booking"],
  },
  {
    id: "SC-041",
    source: "Valid economy RBD L on AA",
    tags: ["ticket"],
    taxonomy: { dataRichness: "ticket+rbd" },
    segments: [{ ...CLASSIC_RTW[0]!, marketingCarrier: "AA", rbd: "L" }, ...CLASSIC_RTW.slice(1)],
    ticket: { pnrHasOsiRtw: true },
    expectValid: true,
    rulesTouched: ["R3015-5b-booking", "R3015-5-reservations"],
  },
  {
    id: "SC-042",
    source: "Cuba itinerary with AA-operated sector",
    tags: ["compliance", "carriers", "smoke-api"],
    taxonomy: { dataRichness: "carrier+geo", failureCluster: "cuba-restriction" },
    segments: [
      { from: "MIA", to: "HAV", marketingCarrier: "AA", operatingCarrier: "AA" },
      { from: "HAV", to: "LHR", marketingCarrier: "BA", operatingCarrier: "BA" },
      { from: "LHR", to: "JFK", marketingCarrier: "BA", operatingCarrier: "BA" },
      { from: "JFK", to: "MIA", marketingCarrier: "AA", operatingCarrier: "AA" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-15-cuba"],
    rulesTouched: ["R3015-15-cuba"],
  },
  {
    id: "SC-043",
    source: "BA/QF ground transport segment not permitted",
    tags: ["compliance"],
    taxonomy: { dataRichness: "carrier", failureCluster: "ground-transport" },
    segments: [{ ...CLASSIC_RTW[0]!, groundTransport: true }, ...CLASSIC_RTW.slice(1)],
    expectValid: false,
    expectRuleIds: ["R3015-4-no-ground-transport"],
    rulesTouched: ["R3015-4-no-ground-transport"],
  },
  {
    id: "SC-044",
    source: "3-continent Explorer fare originating in South America (GRU)",
    tags: ["compliance", "smoke-api"],
    taxonomy: { originMarket: "SA", fareClass: "LONE3", failureCluster: "continent-origin" },
    segments: [
      { from: "GRU", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "GRU" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-0-three-continent-origin"],
    rulesTouched: ["R3015-0-three-continent-origin", "R3015-0-continent-count"],
  },
  {
    id: "SC-045",
    source: "Business class 4-continent RTW — DONE4 fare basis",
    tags: ["builder", "smoke-ui"],
    travelClass: "business",
    taxonomy: { fareClass: "DONE4", journeyShape: "classic-rtw", dataRichness: "geometry-only" },
    segments: CLASSIC_RTW,
    expectValid: true,
    rulesTouched: ["R3015-0-fare-basis", "R3015-0-fare-class"],
  },
  {
    id: "SC-046",
    source: "First class 3-continent — AONE3 fare basis",
    tags: ["builder"],
    travelClass: "first",
    taxonomy: { fareClass: "AONE3", journeyShape: "short-rtw", dataRichness: "geometry-only" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "HKG" },
      { from: "HKG", to: "JFK" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-0-fare-basis", "R3015-0-fare-class"],
  },
  {
    id: "SC-047",
    source: "SWP origin — one permitted transoceanic surface sector",
    tags: ["geometry-only", "open-jaw"],
    taxonomy: { journeyShape: "swp-origin", dataRichness: "geometry-only" },
    segments: [
      { from: "SYD", to: "HNL", surface: true },
      { from: "HNL", to: "LAX" },
      { from: "LAX", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-4g-swp-transoceanic", "R3015-4g-surface", "R3015-0-three-continent-origin"],
  },
  {
    id: "SC-048",
    source: "SWP origin — two transoceanic surface sectors not permitted",
    tags: ["geometry-only"],
    taxonomy: { journeyShape: "swp-origin", dataRichness: "geometry-only", failureCluster: "surface" },
    segments: [
      { from: "SYD", to: "HNL", surface: true },
      { from: "HNL", to: "LHR", surface: true },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SYD" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4g-swp-transoceanic"],
    rulesTouched: ["R3015-4g-swp-transoceanic", "R3015-4g-surface"],
  },
  {
    id: "SC-049",
    source: "Mid-itinerary return via origin point (§4d)",
    tags: ["geometry-only", "smoke-api"],
    taxonomy: { journeyShape: "via-origin", dataRichness: "geometry-only", failureCluster: "via-origin" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "JFK" },
      { from: "JFK", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4d-no-via-origin"],
    rulesTouched: ["R3015-4d-no-via-origin"],
  },
  {
    id: "SC-050",
    source: "Double Atlantic crossing — extra TATL",
    tags: ["geometry-only", "smoke-api"],
    taxonomy: { journeyShape: "backtrack", dataRichness: "geometry-only", failureCluster: "ocean-crossing" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4a"],
    rulesTouched: ["R3015-4a", "R3015-4b-direction", "R3015-4e-intercon"],
  },
  {
    id: "SC-051",
    source: "IONE3 business 3-continent from disallowed sale market XX",
    tags: ["compliance", "ticket"],
    travelClass: "business",
    taxonomy: { fareClass: "IONE3", originMarket: "US", dataRichness: "ticket", failureCluster: "IONE3-markets" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "HKG" },
      { from: "HKG", to: "JFK" },
    ],
    ticket: { saleMarket: "XX" },
    expectValid: true,
    rulesTouched: ["R3015-0-IONE3-markets", "R3015-0-fare-basis"],
  },
  {
    id: "SC-052",
    source: "Business 3-continent DONE3 from allowed US market",
    tags: ["builder"],
    travelClass: "business",
    taxonomy: { fareClass: "DONE3", originMarket: "US", dataRichness: "geometry-only" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "HKG" },
      { from: "HKG", to: "JFK" },
    ],
    ticket: { saleMarket: "US" },
    expectValid: true,
    rulesTouched: ["R3015-0-fare-basis", "R3015-0-IONE3-markets"],
  },
  {
    id: "SC-053",
    source: "Transoceanic intermediate surface from non-SWP origin",
    tags: ["geometry-only"],
    taxonomy: { dataRichness: "geometry-only", failureCluster: "surface" },
    segments: [{ from: "JFK", to: "LHR", surface: true }, ...CLASSIC_RTW.slice(1)],
    expectValid: false,
    expectRuleIds: ["R3015-4g-surface"],
    rulesTouched: ["R3015-4g-surface"],
  },
  {
    id: "SC-054",
    source: "TC backtracking — LHR return before Pacific crossing",
    tags: ["geometry-only"],
    taxonomy: { journeyShape: "backtrack", failureCluster: "direction" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4b-direction"],
    rulesTouched: ["R3015-4b-direction", "R3015-4e-intercon"],
  },
  {
    id: "SC-055",
    source: "Too few segments (§4h minimum 3)",
    tags: ["geometry-only"],
    taxonomy: { dataRichness: "geometry-only", failureCluster: "segment-count" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "JFK" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4h-segment-count"],
    rulesTouched: ["R3015-4h-segment-count", "R3015-0-continent-count"],
  },
  {
    id: "SC-056",
    source: "Excessive Alaska segments — two arrivals in AK",
    tags: ["geometry-only"],
    taxonomy: { dataRichness: "geometry-only", failureCluster: "alaska" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "ANC" },
      { from: "ANC", to: "SEA" },
      { from: "SEA", to: "ANC" },
      { from: "ANC", to: "JFK" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4k-alaska"],
    rulesTouched: ["R3015-4k-alaska"],
  },
  {
    id: "SC-057",
    source: "Australia PER–SYD limited pair flown twice same direction",
    tags: ["geometry-only"],
    taxonomy: { dataRichness: "geometry-only", failureCluster: "australia-domestic" },
    segments: [
      { from: "SYD", to: "PER" },
      { from: "PER", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "SYD" },
      { from: "SYD", to: "PER" },
      { from: "PER", to: "SYD" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4l-australia"],
    rulesTouched: ["R3015-4l-australia"],
  },
  {
    id: "SC-058",
    source: "Missing PNR OSI YY OW RTW",
    tags: ["ticket", "compliance"],
    taxonomy: { dataRichness: "ticket", failureCluster: "reservations" },
    segments: CLASSIC_RTW,
    ticket: { pnrHasOsiRtw: false },
    expectValid: false,
    expectRuleIds: ["R3015-5-reservations"],
    rulesTouched: ["R3015-5-reservations"],
  },
  {
    id: "SC-059",
    source: "Higher booking class on one sector vs declared economy",
    tags: ["compliance"],
    taxonomy: { dataRichness: "segment-class", failureCluster: "fare-class" },
    segments: [...CLASSIC_RTW.slice(0, 5), { from: "LAX", to: "JFK", bookingClass: "business" }],
    travelClass: "economy",
    expectValid: false,
    expectRuleIds: ["R3015-0-fare-class"],
    rulesTouched: ["R3015-0-fare-class"],
  },
  {
    id: "SC-060",
    source: "SWP–Europe direct QF1 — Asia counted via §0 SWP-EU-via-Asia",
    tags: ["geometry-only", "compliance"],
    taxonomy: { journeyShape: "swp-eu-direct", dataRichness: "geometry-only" },
    segments: [
      { from: "LHR", to: "SYD", flightNumber: "QF1" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "LHR" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-0-swp-eu-via-asia", "R3015-0-continent-count", "R3015-0-fare-basis"],
  },
  {
    id: "SC-061",
    source: "Asia — third intercontinental departure exceeds allowance",
    tags: ["geometry-only"],
    taxonomy: { failureCluster: "intercon-asia" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "NRT" },
      { from: "NRT", to: "LAX" },
      { from: "LAX", to: "HKG" },
      { from: "HKG", to: "LHR" },
      { from: "LHR", to: "DEL" },
      { from: "DEL", to: "SYD" },
      { from: "SYD", to: "JFK" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4e-2-asia"],
    rulesTouched: ["R3015-4e-2-asia", "R3015-4e-intercon"],
  },
  {
    id: "SC-062",
    source: "Africa + Europe both directions — Mauritius not permitted",
    tags: ["geometry-only"],
    taxonomy: { failureCluster: "africa-eu" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "JNB" },
      { from: "JNB", to: "MRU" },
      { from: "MRU", to: "CDG" },
      { from: "CDG", to: "JFK" },
      { from: "JFK", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4e-3-africa-eu"],
    rulesTouched: ["R3015-4e-3-africa-eu"],
  },
  {
    id: "SC-063",
    source: "US/Canada domestic sectors not counted international for §4(f)",
    tags: ["geometry-only"],
    taxonomy: { journeyShape: "us-ca-domestic" },
    segments: [
      { from: "JFK", to: "YYZ" },
      { from: "YYZ", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-4f-us-ca-domestic", "R3015-4f-origin-intl"],
  },
  {
    id: "SC-064",
    source: "Eligible carrier online transfer between BA sectors",
    tags: ["carriers"],
    taxonomy: { dataRichness: "carrier" },
    segments: CLASSIC_RTW.map((s, i) =>
      i === 1 ? { ...s, marketingCarrier: "BA", operatingCarrier: "BA" } : s,
    ),
    expectValid: true,
    rulesTouched: ["R3015-9-transfers", "R3015-4-carriers"],
  },
  {
    id: "SC-065",
    source: "Panama PTY counts as North America continent",
    tags: ["geometry-only", "compliance"],
    taxonomy: { dataRichness: "geography" },
    segments: [
      { from: "PTY", to: "MIA" },
      { from: "MIA", to: "LHR" },
      { from: "LHR", to: "HKG" },
      { from: "HKG", to: "PTY" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-0-na-includes", "R3015-0-continent-def", "R3015-0-tc-def"],
  },
  {
    id: "SC-066",
    source: "Middle East sub-zone routing (DXB/RUH)",
    tags: ["geometry-only"],
    taxonomy: { dataRichness: "geography" },
    segments: [
      { from: "DXB", to: "RUH" },
      { from: "RUH", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "DXB" },
    ],
    expectValid: false,
    rulesTouched: ["R3015-0-eu-me-zones", "R3015-4c-open-jaw-b"],
  },
  {
    id: "SC-067",
    source: "Central Asia ALA counts as Asia continent",
    tags: ["geometry-only"],
    taxonomy: { dataRichness: "geography" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "ALA" },
      { from: "ALA", to: "HKG" },
      { from: "HKG", to: "JFK" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-0-asia-countries", "R3015-0-continent-def"],
  },
  {
    id: "SC-068",
    source: "5-continent RTW — LONE5 economy",
    tags: ["builder", "smoke-ui"],
    taxonomy: { fareClass: "LONE5", journeyShape: "extended-rtw" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "GRU" },
      { from: "GRU", to: "JFK" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-0-continent-count", "R3015-0-fare-basis", "R3015-4e-intercon"],
  },
  {
    id: "SC-069",
    source: "6-continent RTW — LONE6 economy cap",
    tags: ["builder"],
    taxonomy: { fareClass: "LONE6", journeyShape: "max-continents" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "NBO" },
      { from: "NBO", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "GRU" },
      { from: "GRU", to: "SCL" },
      { from: "SCL", to: "JFK" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-0-continent-count", "R3015-0-fare-basis", "R3015-4e-3-africa-eu"],
  },
  {
    id: "SC-070",
    source: "First class 4-continent — AONE4",
    tags: ["builder"],
    travelClass: "first",
    taxonomy: { fareClass: "AONE4" },
    segments: CLASSIC_RTW,
    expectValid: true,
    rulesTouched: ["R3015-0-fare-basis", "R3015-0-fare-class"],
  },
  {
    id: "SC-071",
    source: "Business 5-continent — DONE5",
    tags: ["builder"],
    travelClass: "business",
    taxonomy: { fareClass: "DONE5" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "GRU" },
      { from: "GRU", to: "JFK" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-0-fare-basis"],
  },
  {
    id: "SC-072",
    source: "QF/QQ Alliance Airlines codeshare exception",
    tags: ["carriers"],
    taxonomy: { dataRichness: "carrier" },
    segments: [{ ...CLASSIC_RTW[0]!, marketingCarrier: "QF", operatingCarrier: "QQ" }, ...CLASSIC_RTW.slice(1)],
    expectValid: true,
    rulesTouched: ["R3015-4j-jq-qq"],
  },
  {
    id: "SC-073",
    source: "WY stock valid with full ticketing context",
    tags: ["ticket"],
    taxonomy: { dataRichness: "ticket" },
    segments: CLASSIC_RTW,
    ticket: { validatingCarrier: "WY", pnrHasOsiRtw: true, purchasedBeforeDeparture: true },
    expectValid: true,
    rulesTouched: ["R3015-15-stock", "R3015-0-purchase", "R3015-5-reservations"],
  },
  {
    id: "SC-074",
    source: "North America third intercontinental departure",
    tags: ["geometry-only"],
    taxonomy: { failureCluster: "intercon-na" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "GRU" },
      { from: "GRU", to: "EZE" },
      { from: "EZE", to: "JFK" },
      { from: "JFK", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4e-1-na"],
    rulesTouched: ["R3015-4e-1-na", "R3015-4e-intercon"],
  },
  {
    id: "SC-075",
    source: "TC2 origin min stay not enforced (non-TC1)",
    tags: ["schedule"],
    taxonomy: { originMarket: "TC2", dataRichness: "schedule" },
    segments: [
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "LHR" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-6-min-stay"],
  },
  {
    id: "SC-076",
    source: "Cuba RTW with non-AA operators only — §15 pass",
    tags: ["compliance", "carriers"],
    taxonomy: { dataRichness: "carrier+geo" },
    segments: [
      { from: "MIA", to: "HAV", marketingCarrier: "BA", operatingCarrier: "BA" },
      { from: "HAV", to: "LHR", marketingCarrier: "BA", operatingCarrier: "BA" },
      { from: "LHR", to: "DXB", marketingCarrier: "BA", operatingCarrier: "BA" },
      { from: "DXB", to: "SIN", marketingCarrier: "BA", operatingCarrier: "BA" },
      { from: "SIN", to: "SYD", marketingCarrier: "QF", operatingCarrier: "QF" },
      { from: "SYD", to: "LAX", marketingCarrier: "QF", operatingCarrier: "QF" },
      { from: "LAX", to: "MIA", marketingCarrier: "BA", operatingCarrier: "BA" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-15-cuba"],
  },
  {
    id: "SC-077",
    source: "Valid BA-only marketed sectors throughout",
    tags: ["carriers", "smoke-ui"],
    taxonomy: { dataRichness: "carrier" },
    segments: CLASSIC_RTW.map((s) => ({ ...s, marketingCarrier: "BA", operatingCarrier: "BA" })),
    ticket: { validatingCarrier: "BA", pnrHasOsiRtw: true },
    expectValid: true,
    rulesTouched: ["R3015-4-carriers"],
  },
  {
    id: "SC-078",
    source: "Reverse-direction duplicate sector permitted (LHR–JFK then JFK–LHR)",
    tags: ["geometry-only"],
    taxonomy: { journeyShape: "reverse-sector-ok" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "JFK" },
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "JFK" },
    ],
    expectValid: false,
    rulesTouched: ["R3015-4i-duplicate-sector", "R3015-4a"],
  },
  {
    id: "SC-079",
    source: "Westbound RTW SYD origin closed loop",
    tags: ["builder", "smoke-ui"],
    taxonomy: { journeyShape: "westbound-rtw", originMarket: "AU" },
    segments: [
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "LHR" },
      { from: "LHR", to: "SIN" },
      { from: "SIN", to: "SYD" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-4a", "R3015-4b-direction", "R3015-4c-origin"],
  },
  {
    id: "SC-080",
    source: "Europe origin implicit open jaw OSL–TRD",
    tags: ["open-jaw", "geometry-only"],
    taxonomy: { journeyShape: "open-jaw", originMarket: "NO" },
    segments: [
      { from: "OSL", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "TRD" },
    ],
    expectValid: true,
    expectOriginReturnMode: "openJaw",
    expectActiveRules: ["R3015-4c-open-jaw-a", "R3015-4c-origin"],
    rulesTouched: ["R3015-4c-open-jaw-a", "R3015-4c-origin"],
  },
  {
    id: "SC-081",
    source: "IONE3 allowed from US sale market",
    tags: ["ticket", "builder"],
    travelClass: "business",
    taxonomy: { fareClass: "IONE3", originMarket: "US" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "HKG" },
      { from: "HKG", to: "JFK" },
    ],
    ticket: { saleMarket: "US" },
    expectValid: true,
    rulesTouched: ["R3015-0-IONE3-markets"],
  },
  {
    id: "SC-082",
    source: "IB stock with WY validating when QF/JQ present — also blocked",
    tags: ["ticket", "carriers"],
    taxonomy: { dataRichness: "ticket+carrier" },
    segments: [{ ...CLASSIC_RTW[0]!, marketingCarrier: "QF", operatingCarrier: "JQ" }, ...CLASSIC_RTW.slice(1)],
    ticket: { validatingCarrier: "WY" },
    expectValid: false,
    expectRuleIds: ["R3015-15-stock-jq"],
    rulesTouched: ["R3015-15-stock-jq"],
  },
  {
    id: "SC-083",
    source: "Single transcontinental US flight within allowance",
    tags: ["geometry-only", "smoke-ui"],
    taxonomy: { journeyShape: "transcon-ok" },
    segments: [
      { from: "JFK", to: "LAX" },
      { from: "LAX", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "JFK" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-4k-us-transcon"],
  },
  {
    id: "SC-084",
    source: "Origin international departure limit — extra US intl out",
    tags: ["geometry-only"],
    taxonomy: { failureCluster: "origin-intl" },
    segments: [
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "GRU" },
      { from: "GRU", to: "LHR" },
      { from: "LHR", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "LHR" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4f-origin-intl"],
    rulesTouched: ["R3015-4f-origin-intl"],
  },
  {
    id: "SC-085",
    source: "Full ticket + schedule + carrier golden path",
    tags: ["smoke-api", "smoke-ui", "booking"],
    taxonomy: { dataRichness: "full", journeyShape: "classic-rtw" },
    segments: CLASSIC_RTW.map((s, i) => ({
      ...s,
      marketingCarrier: i === 0 ? "AA" : i === 4 ? "QF" : "BA",
      operatingCarrier: i === 0 ? "AA" : i === 4 ? "QF" : "BA",
      rbd: i === 0 ? "L" : undefined,
      departureTime:
        i === 0 ? "2026-06-01T10:00:00Z" : i === 1 ? "2026-06-04T10:00:00Z" : i === 2 ? "2026-06-08T10:00:00Z" : i === 4 ? "2026-06-20T10:00:00Z" : undefined,
      arrivalTime: i === 0 ? "2026-06-02T10:00:00Z" : i === 1 ? "2026-06-05T10:00:00Z" : undefined,
    })),
    ticket: {
      purchasedBeforeDeparture: true,
      validatingCarrier: "BA",
      saleMarket: "US",
      pnrHasOsiRtw: true,
    },
    expectValid: true,
    minPassedRules: 40,
    rulesTouched: [
      "R3015-0-purchase",
      "R3015-4-carriers",
      "R3015-5b-booking",
      "R3015-5-reservations",
      "R3015-6-min-stay",
      "R3015-8-stopovers",
      "R3015-15-stock",
    ],
  },
  {
    id: "SC-086",
    source: "Geometry-only baseline — no ticket or carrier metadata",
    tags: ["smoke-api", "geometry-only"],
    taxonomy: { dataRichness: "geometry-only", journeyShape: "classic-rtw" },
    segments: CLASSIC_RTW,
    expectValid: true,
    rulesTouched: [
      "R3015-0-tc-def",
      "R3015-0-continent-def",
      "R3015-0-eu-me-zones",
      "R3015-0-asia-countries",
      "R3015-0-na-includes",
      "R3015-4h-segment-count",
      "R3015-4h-continent-limits",
    ],
  },
  {
    id: "SC-087",
    source: "US origin §4f warning becomes error without transfer pair",
    tags: ["smoke-ui", "geometry-only"],
    taxonomy: { failureCluster: "usa-exception" },
    segments: [
      { from: "JFK", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "JFK" },
      { from: "JFK", to: "CDG" },
      { from: "CDG", to: "LHR" },
      { from: "LHR", to: "JFK" },
    ],
    expectValid: false,
    expectRuleIds: ["R3015-4f-usa-exception"],
    rulesTouched: ["R3015-4f-usa-exception", "R3015-4f-origin-intl"],
  },
  {
    id: "SC-088",
    source: "Maldives–Sri Lanka surface sector within permitted §4c-g pair",
    tags: ["open-jaw"],
    taxonomy: { journeyShape: "open-jaw" },
    segments: [
      { from: "MLE", to: "CMB", surface: true },
      { from: "CMB", to: "LHR" },
      { from: "LHR", to: "JFK" },
      { from: "JFK", to: "NRT" },
      { from: "NRT", to: "SYD" },
      { from: "SYD", to: "MLE" },
    ],
    expectValid: false,
    expectOriginReturnMode: "closedLoop",
    rulesTouched: ["R3015-4c-open-jaw-g", "R3015-4b-direction"],
  },
  {
    id: "SC-089",
    source: "HKG–PEK implicit open jaw without surface flag",
    tags: ["open-jaw"],
    taxonomy: { journeyShape: "open-jaw" },
    segments: [
      { from: "HKG", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "PEK" },
    ],
    expectValid: false,
    expectOriginReturnMode: "openJaw",
    expectActiveRules: ["R3015-4c-open-jaw-d"],
    rulesTouched: ["R3015-4c-open-jaw-d"],
  },
  {
    id: "SC-090",
    source: "Caribbean origin counts as North America (MIA RTW)",
    tags: ["geometry-only", "compliance"],
    taxonomy: { originMarket: "US", dataRichness: "geography" },
    segments: [
      { from: "MIA", to: "LHR" },
      { from: "LHR", to: "DXB" },
      { from: "DXB", to: "SIN" },
      { from: "SIN", to: "SYD" },
      { from: "SYD", to: "LAX" },
      { from: "LAX", to: "MIA" },
    ],
    expectValid: true,
    rulesTouched: ["R3015-0-na-includes", "R3015-0-three-continent-origin"],
  },
];

function validateScenario(s: CatalogScenario): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const opts = {
    travelClass: s.travelClass ?? "economy",
    ticket: s.ticket,
  };
  const result = validateRoute(s.segments, opts);

  if (result.valid !== s.expectValid) {
    errors.push(`expectValid ${s.expectValid} but got ${result.valid} (outcome=${result.outcome})`);
    const codes = result.issues.map((i) => i.code).slice(0, 8);
    errors.push(`issues: ${codes.join(", ")}`);
  }

  if (s.expectOutcome && result.outcome !== s.expectOutcome) {
    errors.push(`expectOutcome ${s.expectOutcome} but got ${result.outcome}`);
  }

  for (const ruleId of s.expectRuleIds ?? []) {
    if (!result.issues.some((i) => i.code === ruleId)) {
      errors.push(`missing expected rule issue ${ruleId}`);
    }
  }

  for (const code of s.expectIssueCodes ?? []) {
    if (!result.issues.some((i) => i.code === code)) {
      errors.push(`missing expected issue code ${code}`);
    }
  }

  if (s.expectOriginReturnMode && result.analysis?.originReturn.mode !== s.expectOriginReturnMode) {
    errors.push(
      `expectOriginReturnMode ${s.expectOriginReturnMode} but got ${result.analysis?.originReturn.mode}`,
    );
  }

  for (const ruleId of s.expectActiveRules ?? []) {
    const ev = result.ruleEvaluations.find((r) => r.ruleId === ruleId);
    if (ev?.applicability !== "active") {
      errors.push(`expected active rule ${ruleId} got ${ev?.applicability}`);
    }
  }

  for (const ruleId of s.expectNotApplicableRules ?? []) {
    const ev = result.ruleEvaluations.find((r) => r.ruleId === ruleId);
    if (ev?.applicability !== "notApplicable") {
      errors.push(`expected notApplicable rule ${ruleId} got ${ev?.applicability}`);
    }
  }

  if (s.minPassedRules !== undefined) {
    const passed = result.ruleEvaluations.filter((r) => r.passed).length;
    if (passed < s.minPassedRules) {
      errors.push(`minPassedRules ${s.minPassedRules} but passed ${passed}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

function assignSmokeTags(scenarios: CatalogScenario[]) {
  const smokeApi = [
    "SC-001", "SC-002", "SC-004", "SC-006", "SC-008", "SC-009", "SC-015", "SC-016", "SC-019",
    "SC-026", "SC-027", "SC-028", "SC-031", "SC-032", "SC-035", "SC-037", "SC-042", "SC-044",
    "SC-047", "SC-049", "SC-050", "SC-085", "SC-086",
    "SC-003", "SC-005", "SC-007", "SC-010", "SC-011", "SC-017", "SC-025",
  ];
  const smokeUi = [
    "SC-001", "SC-009", "SC-015", "SC-016", "SC-019", "SC-023", "SC-045", "SC-068", "SC-077",
    "SC-079", "SC-083", "SC-085", "SC-087", "SC-020", "SC-024",
  ];

  for (const s of scenarios) {
    const tags = new Set(s.tags ?? []);
    if (smokeApi.includes(s.id)) tags.add("smoke-api");
    if (smokeUi.includes(s.id)) tags.add("smoke-ui");
    s.tags = [...tags];
  }
  return { smokeApi, smokeUi };
}

function buildMarkdown(scenarios: CatalogScenario[], smokeApi: string[], smokeUi: string[]): string {
  const byTaxonomy = new Map<string, CatalogScenario[]>();
  for (const s of scenarios) {
    const key =
      s.taxonomy?.failureCluster ??
      s.taxonomy?.journeyShape ??
      s.taxonomy?.dataRichness ??
      "general";
    if (!byTaxonomy.has(key)) byTaxonomy.set(key, []);
    byTaxonomy.get(key)!.push(s);
  }

  const lines: string[] = [
    "# Scenario Catalog",
    "",
    `Generated scenario catalog for Oneworld Explorer R3015 validation. **${scenarios.length} scenarios** covering geometry, open-jaw, carrier, ticket, and schedule dimensions.`,
    "",
    "## Summary",
    "",
    `- Total scenarios: **${scenarios.length}**`,
    `- Fixture-backed (SC-001–SC-025): **25**`,
    `- Extended catalog (SC-026+): **${scenarios.length - 25}**`,
    `- \`enforceInV01\` rules with \`rulesTouched\` coverage: **${ALL_V01_RULES.length}**`,
    "",
    "## By taxonomy",
    "",
  ];

  const sortedKeys = [...byTaxonomy.keys()].sort();
  for (const key of sortedKeys) {
    const group = byTaxonomy.get(key)!;
    lines.push(`### ${key}`, "");
    lines.push("| ID | Source | Valid | Tags |");
    lines.push("| --- | --- | --- | --- |");
    for (const s of group.sort((a, b) => a.id.localeCompare(b.id))) {
      lines.push(
        `| ${s.id} | ${s.source.replace(/\|/g, "\\|")} | ${s.expectValid ? "yes" : "no"} | ${(s.tags ?? []).join(", ")} |`,
      );
    }
    lines.push("");
  }

  lines.push("## Open-jaw coverage (§4c)", "");
  lines.push("| Type | Rule | Scenario IDs |");
  lines.push("| --- | --- | --- |");
  const openJawMap: [string, string, string[]][] = [
    ["within-origin-country", "R3015-4c-open-jaw-a", []],
    ["within-middle-east", "R3015-4c-open-jaw-b", []],
    ["us-canada", "R3015-4c-open-jaw-c", []],
    ["hkg-china", "R3015-4c-open-jaw-d", []],
    ["my-sin", "R3015-4c-open-jaw-e", []],
    ["within-africa", "R3015-4c-open-jaw-f", []],
    ["mv-lk-in", "R3015-4c-open-jaw-g", []],
  ];
  for (const s of scenarios) {
    for (const row of openJawMap) {
      if (s.rulesTouched?.includes(row[1]) || s.expectActiveRules?.includes(row[1])) {
        row[2].push(s.id);
      }
    }
  }
  for (const [type, rule, ids] of openJawMap) {
    lines.push(`| ${type} | ${rule} | ${ids.join(", ") || "—"} |`);
  }
  lines.push("");

  lines.push("## Rule coverage (`rulesTouched`)", "");
  const ruleHits = new Map<string, string[]>();
  for (const r of ALL_V01_RULES) ruleHits.set(r, []);
  for (const s of scenarios) {
    for (const r of s.rulesTouched ?? []) {
      if (ruleHits.has(r)) ruleHits.get(r)!.push(s.id);
    }
  }
  lines.push("| Rule | Scenarios |");
  lines.push("| --- | --- |");
  for (const r of ALL_V01_RULES) {
    lines.push(`| ${r} | ${(ruleHits.get(r) ?? []).join(", ") || "—"} |`);
  }
  lines.push("");

  lines.push("## Smoke selections", "");
  lines.push("### smoke-api (30)", "");
  lines.push(smokeApi.map((id) => `- ${id}`).join("\n"));
  lines.push("");
  lines.push("### smoke-ui (15)", "");
  lines.push(smokeUi.map((id) => `- ${id}`).join("\n"));
  lines.push("");

  return lines.join("\n");
}

function main() {
  const fixtures = loadFixtures().map(enrichFixture);
  const fixtureIds = new Set(fixtures.map((f) => f.id));
  const extras = GAP_AND_NEW.filter((s) => !fixtureIds.has(s.id));

  const catalog = [...fixtures, ...extras].sort((a, b) => a.id.localeCompare(b.id));
  if (catalog.length < 85) {
    throw new Error(`Only ${catalog.length} scenarios — need at least 85`);
  }

  const failures: string[] = [];
  for (const s of catalog) {
    const { ok, errors } = validateScenario(s);
    if (!ok) failures.push(`${s.id}: ${errors.join("; ")}`);
  }

  const covered = new Set<string>();
  for (const s of catalog) for (const r of s.rulesTouched ?? []) if (ALL_V01_RULES.includes(r)) covered.add(r);
  const missingRules = ALL_V01_RULES.filter((r) => !covered.has(r));
  if (missingRules.length) {
    failures.push(`rulesTouched missing v01 rules: ${missingRules.join(", ")}`);
  }

  if (failures.length) {
    console.error("Validation failures:\n" + failures.join("\n"));
    process.exit(1);
  }

  assignSmokeTags(catalog);
  const smokeApi = catalog.filter((s) => s.tags?.includes("smoke-api")).map((s) => s.id);
  const smokeUi = catalog.filter((s) => s.tags?.includes("smoke-ui")).map((s) => s.id);

  mkdirSync(dirname(DOC_PATH), { recursive: true });
  writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n");
  writeFileSync(DOC_PATH, buildMarkdown(catalog, smokeApi, smokeUi));

  console.log(`Wrote ${catalog.length} scenarios to ${CATALOG_PATH}`);
  console.log(`smoke-api (${smokeApi.length}): ${smokeApi.join(", ")}`);
  console.log(`smoke-ui (${smokeUi.length}): ${smokeUi.join(", ")}`);
}

main();
