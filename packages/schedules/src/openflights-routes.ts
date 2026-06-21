/**
 * Route index loaders — eligible oneworld routes, manual overrides, future-member preview.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FLIGHTSFROM_WEEKLY_SOURCE,
  JONTY_VENDOR_FILENAME,
  parseJontyRoutes,
  type JontyAirportEntry,
} from "./jonty-routes.js";

export interface RoutePair {
  carrier: string;
  from: string;
  to: string;
  source: string;
  note?: string;
  inactive?: boolean;
  lastSeenQuarter?: string;
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const indexPath = join(repoRoot, "data/eligible-routes.index.json");
const overridesPath = join(repoRoot, "data/route-overrides.json");
const vendorPath = join(repoRoot, "data/vendor", JONTY_VENDOR_FILENAME);
const previewPath = join(repoRoot, "data/future-member-routes.preview.json");
const registryPath = join(repoRoot, "data/CARRIER-REGISTRY.json");

let cached: RoutePair[] | null = null;
let cachedFuture: Map<string, RoutePair[]> | null = null;

export function loadOpenFlightsRoutes(): RoutePair[] {
  if (cached) return cached;
  if (!existsSync(indexPath)) {
    cached = [];
    return cached;
  }
  const base = JSON.parse(readFileSync(indexPath, "utf-8")) as RoutePair[];
  cached = mergeRouteLists(base, loadRouteOverrides());
  return cached;
}

export function loadRouteOverrides(): RoutePair[] {
  if (!existsSync(overridesPath)) return [];
  return JSON.parse(readFileSync(overridesPath, "utf-8")) as RoutePair[];
}

export function isRouteInactive(from: string, to: string): boolean {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  return loadRouteOverrides().some(
    (r) =>
      r.inactive &&
      ((r.from.toUpperCase() === f && r.to.toUpperCase() === t) ||
        (r.from.toUpperCase() === t && r.to.toUpperCase() === f)),
  );
}

export function routeConfidence(from: string, to: string, carriers: string[]): "observed" | "historical" | "inactive" {
  if (isRouteInactive(from, to)) return "inactive";
  const merged = loadOpenFlightsRoutes();
  const onRoute = merged.filter((r) => r.from === from.toUpperCase() && r.to === to.toUpperCase() && !r.inactive);
  if (onRoute.some((r) => r.source === "adsb-observed" || r.lastSeenQuarter)) return "observed";
  if (onRoute.some((r) => r.source === FLIGHTSFROM_WEEKLY_SOURCE)) return "observed";
  if (carriers.length > 0) return "historical";
  return "historical";
}

function mergeRouteLists(...lists: RoutePair[][]): RoutePair[] {
  const seen = new Set<string>();
  const out: RoutePair[] = [];
  for (const list of lists) {
    for (const r of list) {
      if (r.inactive) continue;
      const key = `${r.from}-${r.to}-${r.carrier}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
  }
  return out;
}

export function loadFutureMemberCarriers(): string[] {
  if (!existsSync(registryPath)) return [];
  const reg = JSON.parse(readFileSync(registryPath, "utf-8")) as {
    futureMembers?: Array<{ iata: string }>;
  };
  return (reg.futureMembers ?? []).map((c) => c.iata.toUpperCase());
}

function parseFutureMemberRoutesFromVendor(codes: string[]): RoutePair[] {
  if (!existsSync(vendorPath)) return [];
  const data = JSON.parse(readFileSync(vendorPath, "utf-8")) as Record<string, JontyAirportEntry>;
  const { pairs } = parseJontyRoutes(data, new Set(), {
    carrierFilter: new Set(codes),
    source: "future-member-preview",
  });
  return pairs;
}

/** PR etc. — from committed preview file or local Jonty vendor for dev rebuilds. */
export function loadFutureMemberRoutes(carriers?: string[]): RoutePair[] {
  const codes = (carriers ?? loadFutureMemberCarriers()).map((c) => c.toUpperCase());
  if (codes.length === 0) return [];
  const key = codes.sort().join(",");
  if (!cachedFuture) cachedFuture = new Map();
  if (cachedFuture.has(key)) return cachedFuture.get(key)!;

  let routes: RoutePair[] = [];
  if (existsSync(previewPath)) {
    const all = JSON.parse(readFileSync(previewPath, "utf-8")) as RoutePair[];
    const allowed = new Set(codes);
    routes = all.filter((r) => allowed.has(r.carrier));
  } else {
    routes = parseFutureMemberRoutesFromVendor(codes);
  }

  cachedFuture.set(key, routes);
  return routes;
}

export function loadRoutesForNetwork(options?: { includeFutureMembers?: boolean }): RoutePair[] {
  const base = loadOpenFlightsRoutes();
  if (!options?.includeFutureMembers) return base;
  return mergeRouteLists(base, loadFutureMemberRoutes());
}

export function airportInNetwork(iata: string, routes: RoutePair[] = loadOpenFlightsRoutes()): boolean {
  const code = iata.toUpperCase();
  return routes.some((r) => r.from === code || r.to === code);
}

export function routeExists(
  routes: RoutePair[],
  from: string,
  to: string,
  carriers?: string[],
): boolean {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  return routes.some((r) => {
    if (r.from !== f || r.to !== t) return false;
    if (carriers?.length) return carriers.includes(r.carrier);
    return true;
  });
}

export function carriersOnRoute(
  routes: RoutePair[],
  from: string,
  to: string,
): string[] {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  return [...new Set(routes.filter((r) => r.from === f && r.to === t).map((r) => r.carrier))];
}
