import {
  airportInNetwork,
  carriersOnRoute,
  isRouteInactive,
  loadOpenFlightsRoutes,
  loadRoutesForNetwork,
  routeConfidence,
  type RoutePair,
} from "./openflights-routes.js";
import {
  NETWORK_DISCLAIMER,
  ROUTE_NETWORK_SOURCE,
  ROUTE_NETWORK_SOURCE_PREVIEW,
  routeIndexAsOf,
} from "./route-source.js";

/** RTW-popular hubs — used to rank 1-stop suggestions. */
const POPULAR_HUBS = new Set([
  "SIN",
  "DOH",
  "LHR",
  "SYD",
  "HKG",
  "DXB",
  "NRT",
  "HND",
  "ICN",
  "BKK",
  "KUL",
  "MAD",
  "BCN",
  "ORD",
  "DFW",
  "LAX",
  "JFK",
  "MIA",
]);

export interface HubConnection {
  hub: string;
  firstLegCarriers: string[];
  secondLegCarriers: string[];
}

export interface RouteNetworkResult {
  from: string;
  to: string;
  directCarriers: string[];
  hasDirect: boolean;
  suggestedHubs: HubConnection[];
  source: string;
  asOf: string;
  disclaimer: string;
  previewNote?: string;
  regionalHint?: string;
  hasManualOverride?: boolean;
  confidence?: "observed" | "historical" | "inactive";
  planningHint?: string;
  lastSeenQuarter?: string;
}

export interface DirectDestination {
  iata: string;
  carriers: string[];
  carrierCount: number;
}

export interface ListDestinationsOptions {
  limit?: number;
  continent?: string;
  /** When true, only return destinations that are RTW hub airports. */
  hubsOnly?: boolean;
  /** Filter by Explorer continent on destination node metadata */
  nodeContinent?: (iata: string) => string | null | undefined;
}

export interface ListDestinationsResult {
  from: string;
  destinations: DirectDestination[];
  total: number;
  truncated: boolean;
  source: string;
  asOf: string;
  disclaimer: string;
}

function hubScore(hub: string, firstCarriers: string[], secondCarriers: string[]): number {
  let score = 0;
  if (POPULAR_HUBS.has(hub)) score += 10;
  score += Math.min(firstCarriers.length, 3);
  score += Math.min(secondCarriers.length, 3);
  const shared = firstCarriers.filter((c) => secondCarriers.includes(c));
  score += shared.length * 2;
  return score;
}

function buildAdjacency(routes: RoutePair[]): Map<string, Map<string, Set<string>>> {
  const adj = new Map<string, Map<string, Set<string>>>();
  for (const r of routes) {
    let fromMap = adj.get(r.from);
    if (!fromMap) {
      fromMap = new Map();
      adj.set(r.from, fromMap);
    }
    let carriers = fromMap.get(r.to);
    if (!carriers) {
      carriers = new Set();
      fromMap.set(r.to, carriers);
    }
    carriers.add(r.carrier);
  }
  return adj;
}

export function findHubConnections(
  routes: RoutePair[],
  from: string,
  to: string,
  maxHubs = 3,
): HubConnection[] {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) return [];

  const adj = buildAdjacency(routes);
  const fromMap = adj.get(f);
  if (!fromMap) return [];

  const candidates: Array<{ hub: HubConnection; score: number }> = [];

  for (const [hub, firstCarriersSet] of fromMap) {
    if (hub === t) continue;
    const secondMap = adj.get(hub);
    const secondCarriersSet = secondMap?.get(t);
    if (!secondCarriersSet?.size) continue;

    const firstLegCarriers = [...firstCarriersSet].sort();
    const secondLegCarriers = [...secondCarriersSet].sort();
    const hubConn: HubConnection = {
      hub,
      firstLegCarriers,
      secondLegCarriers,
    };
    candidates.push({
      hub: hubConn,
      score: hubScore(hub, firstLegCarriers, secondLegCarriers),
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, maxHubs).map((c) => c.hub);
}

export function queryRouteNetwork(
  from: string,
  to: string,
  routes: RoutePair[] = loadOpenFlightsRoutes(),
  options?: { includeFutureMembers?: boolean },
): RouteNetworkResult {
  const merged = options?.includeFutureMembers ? loadRoutesForNetwork({ includeFutureMembers: true }) : routes;
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  const inactive = isRouteInactive(f, t);
  let directCarriers = inactive ? [] : carriersOnRoute(merged, f, t).sort();
  const confidence = routeConfidence(f, t, directCarriers);
  const hasDirect = !inactive && directCarriers.length > 0;
  const suggestedHubs = hasDirect ? [] : findHubConnections(merged, f, t);

  const hasManualOverride = merged.some(
    (r) => r.from === f && r.to === t && r.source === "manual-seasonal",
  );
  const previewNote = options?.includeFutureMembers
    ? "Preview — Philippine Airlines (joining oneworld). Carrier rules still treat PR as ineligible until join."
    : undefined;

  let regionalHint: string | undefined;
  if (!hasDirect && suggestedHubs.length === 0 && !airportInNetwork(t, merged)) {
    regionalHint = `${t} is not on the published oneworld network — fly to a major hub in the same country, then finish with an permitted open jaw (e.g. OSL→TOS within Norway). Verify domestic segments separately.`;
  }

  let disclaimer = NETWORK_DISCLAIMER;
  if (hasManualOverride) {
    disclaimer += " Includes seasonal/manual planning hints — confirm dates with the airline.";
  }

  let planningHint: string | undefined;
  if (inactive) {
    planningHint = "No recent nonstop observed — use connections and verify on Google Flights.";
  } else if (confidence === "historical" && hasDirect) {
    planningHint = "Historical route index — verify current timetable before booking.";
  } else if (confidence === "observed" && hasDirect) {
    planningHint = "Published route list — verify timetable before booking.";
  }

  return {
    from: f,
    to: t,
    directCarriers,
    hasDirect,
    suggestedHubs,
    source: options?.includeFutureMembers ? ROUTE_NETWORK_SOURCE_PREVIEW : ROUTE_NETWORK_SOURCE,
    asOf: routeIndexAsOf(),
    disclaimer,
    previewNote,
    regionalHint,
    hasManualOverride,
    confidence,
    planningHint,
  };
}

function destinationScore(hub: string, carriers: string[]): number {
  let score = carriers.length;
  if (POPULAR_HUBS.has(hub)) score += 5;
  return score;
}

export function listDirectDestinations(
  from: string,
  routes: RoutePair[] = loadOpenFlightsRoutes(),
  options: ListDestinationsOptions = {},
): ListDestinationsResult {
  const f = from.trim().toUpperCase();
  const limit = Math.max(1, Math.min(options.limit ?? 60, 500));
  const adj = buildAdjacency(routes);
  const fromMap = adj.get(f);

  if (!fromMap) {
    return {
      from: f,
      destinations: [],
      total: 0,
      truncated: false,
      source: ROUTE_NETWORK_SOURCE,
      asOf: routeIndexAsOf(),
      disclaimer: NETWORK_DISCLAIMER,
    };
  }

  const all: DirectDestination[] = [];
  for (const [dest, carriersSet] of fromMap) {
    if (dest === f) continue;
    if (isRouteInactive(f, dest)) continue;
    if (options.hubsOnly && !POPULAR_HUBS.has(dest)) continue;
    const continent = options.nodeContinent?.(dest);
    if (options.continent && continent !== options.continent) continue;
    const carriers = [...carriersSet].sort();
    all.push({
      iata: dest,
      carriers,
      carrierCount: carriers.length,
    });
  }

  all.sort((a, b) => {
    const scoreDiff =
      destinationScore(b.iata, b.carriers) - destinationScore(a.iata, a.carriers);
    if (scoreDiff !== 0) return scoreDiff;
    return a.iata.localeCompare(b.iata);
  });

  const total = all.length;
  const destinations = all.slice(0, limit);

  return {
    from: f,
    destinations,
    total,
    truncated: total > limit,
    source: ROUTE_NETWORK_SOURCE,
    asOf: routeIndexAsOf(),
    disclaimer: NETWORK_DISCLAIMER,
  };
}

export { routeExists, carriersOnRoute, loadOpenFlightsRoutes, loadRoutesForNetwork, airportInNetwork } from "./openflights-routes.js";
