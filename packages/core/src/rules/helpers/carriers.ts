import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RouteSegment } from "../../ontology/types.js";
import { ELIGIBLE_CARRIERS } from "../constants.js";

export const STOCK_CARRIERS = new Set(
  [...ELIGIBLE_CARRIERS].filter((c) => c !== "NU"),
);

export const AA_EAGLE_OPERATORS = new Set(["MQ", "PT", "OH", "YX", "OO"]);

export const CUBA_BANNED_OPERATORS = new Set([
  "AA",
  "AS",
  "QX",
  ...AA_EAGLE_OPERATORS,
]);

interface RegistryEntry {
  iata?: string;
  marketing?: string;
  operating?: string;
  parent?: string;
}

interface CarrierRegistry {
  eligible: RegistryEntry[];
  codeshareExceptions: Array<{ marketing: string; operating: string }>;
  affiliates: Array<{ iata: string; parent: string }>;
}

let registry: CarrierRegistry | null = null;

function repoRoot(): string {
  const candidates = [
    join(dirname(fileURLToPath(import.meta.url)), "../../../../.."),
    process.cwd(),
    join(process.cwd(), ".."),
  ];
  for (const root of candidates) {
    if (existsSync(join(root, "data/CARRIER-REGISTRY.json"))) return root;
  }
  return join(dirname(fileURLToPath(import.meta.url)), "../../../../..");
}

function loadRegistry(): CarrierRegistry {
  if (registry) return registry;
  const raw = readFileSync(
    join(repoRoot(), "data/CARRIER-REGISTRY.json"),
    "utf-8",
  );
  registry = JSON.parse(raw) as CarrierRegistry;
  return registry;
}

export function normalizeCarrier(code?: string): string | null {
  const c = code?.trim().toUpperCase();
  return c || null;
}

export function isEligibleCarrier(code: string): boolean {
  return ELIGIBLE_CARRIERS.has(code.toUpperCase());
}

export function getAffiliateParent(code: string): string | null {
  const reg = loadRegistry();
  const hit = reg.affiliates.find((a) => a.iata.toUpperCase() === code.toUpperCase());
  return hit?.parent.toUpperCase() ?? null;
}

export function isAffiliateOfEligibleParent(code: string): boolean {
  const parent = getAffiliateParent(code);
  return parent !== null && isEligibleCarrier(parent);
}

export function isCodeshareException(marketing: string, operating: string): boolean {
  const reg = loadRegistry();
  return reg.codeshareExceptions.some(
    (e) =>
      e.marketing.toUpperCase() === marketing.toUpperCase() &&
      e.operating.toUpperCase() === operating.toUpperCase(),
  );
}

export function resolveMarketingCarrier(seg: RouteSegment): string | null {
  return normalizeCarrier(seg.marketingCarrier);
}

export function resolveOperatingCarrier(seg: RouteSegment): string | null {
  return normalizeCarrier(seg.operatingCarrier ?? seg.marketingCarrier);
}

/** §4(j) — permitted codeshare or own-metal eligible service */
export function isPermittedCodeshare(marketing: string, operating: string): boolean {
  const mkt = marketing.toUpperCase();
  const op = operating.toUpperCase();

  if (mkt === op) {
    return isEligibleCarrier(mkt) || isAffiliateOfEligibleParent(op);
  }

  if (isCodeshareException(mkt, op)) return true;
  if (isEligibleCarrier(mkt) && isEligibleCarrier(op)) return true;
  if (isEligibleCarrier(mkt) && isAffiliateOfEligibleParent(op)) return true;

  return false;
}

/** §4 intro — flight must be on eligible metal or permitted affiliate/codeshare */
export function isPermittedFlightSegment(seg: RouteSegment): boolean {
  if (seg.surface) return true;

  const mkt = resolveMarketingCarrier(seg);
  const op = resolveOperatingCarrier(seg);
  if (!mkt && !op) return true;

  const marketing = mkt ?? op!;
  const operating = op ?? mkt!;
  return isPermittedCodeshare(marketing, operating);
}

export function segmentHasCarrierData(seg: RouteSegment): boolean {
  if (seg.surface) return false;
  return Boolean(seg.marketingCarrier?.trim() || seg.operatingCarrier?.trim());
}

export function itineraryHasCarrierData(segments: RouteSegment[]): boolean {
  return segments.some(segmentHasCarrierData);
}

export function hasQfJqSegment(segments: RouteSegment[]): boolean {
  return segments.some((seg) => {
    if (seg.surface) return false;
    const mkt = resolveMarketingCarrier(seg);
    const op = resolveOperatingCarrier(seg);
    return mkt === "QF" && op === "JQ";
  });
}

export function touchesCuba(points: Array<{ country: string }>): boolean {
  return points.some((p) => p.country.toUpperCase() === "CU");
}
