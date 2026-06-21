export type {
  NormalizedFlight,
  ScheduleProvider,
  ScheduleSearchParams,
  ScheduleSearchResult,
} from "./provider.js";

export {
  createAviationstackProvider,
  AviationstackProvider,
  AviationstackError,
  fetchAviationstackFlights,
} from "./aviationstack.js";
export {
  createAeroDataBoxProvider,
  AeroDataBoxProvider,
  AeroDataBoxError,
  fetchAeroDataBoxFlights,
} from "./aerodatabox.js";
export { loadOpenFlightsRoutes, routeExists, type RoutePair } from "./openflights-routes.js";
export {
  NETWORK_DISCLAIMER,
  ROUTE_NETWORK_SOURCE,
  ROUTE_NETWORK_SOURCE_PREVIEW,
  loadRouteSourceMeta,
  routeIndexAsOf,
  type RouteSourceMeta,
} from "./route-source.js";
export {
  queryRouteNetwork,
  findHubConnections,
  carriersOnRoute,
  listDirectDestinations,
  type RouteNetworkResult,
  type HubConnection,
  type DirectDestination,
  type ListDestinationsResult,
  type ListDestinationsOptions,
} from "./route-graph.js";
export {
  loadNetworkNodes,
  loadNetworkEdges,
  loadNetworkSpine,
  networkNodeMap,
  type NetworkNode,
  type NetworkEdge,
  type NetworkSpineEdge,
} from "./network-index.js";
export { createScheduleCache, ScheduleCache } from "./cache.js";
export {
  normalizeAviationstackResponse,
  normalizeAeroDataBoxResponse,
  inferOperatingCarrier,
} from "./normalize.js";
export { filterEligibleFlights } from "./filter-eligible.js";

import type { NormalizedFlight, ScheduleSearchParams, ScheduleSearchResult } from "./provider.js";
import { AeroDataBoxError, createAeroDataBoxProvider } from "./aerodatabox.js";
import { AviationstackError, createAviationstackProvider } from "./aviationstack.js";
import { createScheduleCache } from "./cache.js";
import { filterEligibleFlights } from "./filter-eligible.js";
import { loadOpenFlightsRoutes, routeExists } from "./openflights-routes.js";

export interface SearchSchedulesOptions {
  includeIneligible?: boolean;
  cache?: ReturnType<typeof createScheduleCache>;
  aviationstack?: ReturnType<typeof createAviationstackProvider>;
  aerodatabox?: ReturnType<typeof createAeroDataBoxProvider>;
}

const defaultCache = createScheduleCache();

function baseResult(
  params: ScheduleSearchParams,
  partial: Partial<ScheduleSearchResult> = {},
): ScheduleSearchResult {
  return {
    asOf: new Date().toISOString(),
    flights: [],
    scheduleOnly: true,
    from: params.from.toUpperCase(),
    to: params.to.toUpperCase(),
    date: params.date,
    warnings: [],
    rejected: [],
    ...partial,
  };
}

function filterByCarriers(
  flights: NormalizedFlight[],
  carriers?: string[],
): NormalizedFlight[] {
  if (!carriers?.length) return flights;
  const allowed = new Set(carriers.map((c) => c.toUpperCase()));
  return flights.filter((f) => allowed.has(f.marketingCarrier));
}

/** Search eligible oneworld schedules: OpenFlights pre-check → cache → AS → ADB fallback. */
export async function searchSchedules(
  params: ScheduleSearchParams,
  options: SearchSchedulesOptions = {},
): Promise<ScheduleSearchResult> {
  const cache = options.cache ?? defaultCache;
  const asProvider = options.aviationstack ?? createAviationstackProvider();
  const adbProvider = options.aerodatabox ?? createAeroDataBoxProvider();
  const includeIneligible = options.includeIneligible ?? false;

  const routes = loadOpenFlightsRoutes();
  if (routes.length > 0 && !routeExists(routes, params.from, params.to, params.carriers)) {
    return baseResult(params, {
      warnings: ["Route not in published eligible network"],
      provider: "stub",
    });
  }

  const cached = cache.get(params);
  if (cached) {
    const { eligible, rejected } = filterEligibleFlights(cached);
    return baseResult(params, {
      flights: includeIneligible ? cached : eligible,
      rejected: includeIneligible ? [] : rejected,
      cacheHit: true,
      provider: cached[0]?.provider ?? "cache",
      warnings: eligible.length === 0 && rejected.length > 0
        ? ["No eligible Explorer carriers on this date"]
        : [],
    });
  }

  const warnings: string[] = [];
  let provider = "stub";
  let errorCode: string | undefined;
  let flights: NormalizedFlight[] = [];

  try {
    flights = await asProvider.searchRoute(params);
    if (flights.length > 0) {
      provider = "aviationstack";
    }
  } catch (err) {
    if (err instanceof AviationstackError) {
      if (err.code === "MISSING_KEY") {
        warnings.push("Schedule provider not configured");
      } else if (err.code === "QUOTA_EXCEEDED") {
        warnings.push("Aviationstack quota exceeded");
        errorCode = "QUOTA_EXCEEDED";
      } else if (err.code === "TIMEOUT") {
        warnings.push("Schedule lookup timed out");
        errorCode = "PROVIDER_TIMEOUT";
      } else {
        warnings.push(err.message);
      }
    } else {
      warnings.push("Aviationstack lookup failed");
    }
  }

  if (flights.length === 0) {
    try {
      const adbFlights = await adbProvider.searchRoute(params);
      if (adbFlights.length > 0) {
        flights = adbFlights;
        provider = "aerodatabox";
        errorCode = undefined;
      }
    } catch (err) {
      if (err instanceof AeroDataBoxError) {
        if (err.code === "MISSING_KEY" && !warnings.length) {
          warnings.push("Schedule provider not configured");
        } else if (err.code === "QUOTA_EXCEEDED") {
          warnings.push("AeroDataBox quota exceeded");
          errorCode = "QUOTA_EXCEEDED";
        } else if (err.code === "TIMEOUT") {
          warnings.push("Schedule lookup timed out");
          errorCode = "PROVIDER_TIMEOUT";
        } else if (err.code !== "MISSING_KEY") {
          warnings.push(err.message);
        }
      } else if (flights.length === 0) {
        warnings.push("AeroDataBox lookup failed");
      }
    }
  }

  flights = filterByCarriers(flights, params.carriers);

  if (flights.length > 0) {
    cache.set(params, flights);
  }

  const { eligible, rejected } = filterEligibleFlights(flights);
  const resultFlights = includeIneligible ? flights : eligible;

  if (resultFlights.length === 0 && rejected.length > 0) {
    warnings.push("No eligible Explorer carriers on this date");
  }

  return baseResult(params, {
    flights: resultFlights,
    rejected: includeIneligible ? [] : rejected,
    warnings: warnings.length ? warnings : undefined,
    cacheHit: false,
    provider,
    errorCode,
  });
}
