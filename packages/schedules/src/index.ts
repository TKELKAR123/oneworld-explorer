export type {
  NormalizedFlight,
  ScheduleProvider,
  ScheduleSearchParams,
  ScheduleSearchResult,
} from "./provider.js";

export { createAviationstackProvider, AviationstackProvider } from "./aviationstack.js";
export { createAeroDataBoxProvider, AeroDataBoxProvider } from "./aerodatabox.js";
export { loadOpenFlightsRoutes, routeExists, type RoutePair } from "./openflights-routes.js";
export { createScheduleCache, ScheduleCache } from "./cache.js";
export {
  normalizeAviationstackResponse,
  normalizeAeroDataBoxResponse,
  inferOperatingCarrier,
} from "./normalize.js";
export { filterEligibleFlights } from "./filter-eligible.js";

import type { ScheduleSearchParams, ScheduleSearchResult } from "./provider.js";

/** v0.2 stub — returns empty results until schedule data is integrated. */
export async function searchSchedules(
  _params: ScheduleSearchParams,
): Promise<ScheduleSearchResult & { stub: true }> {
  return {
    asOf: new Date().toISOString(),
    flights: [],
    scheduleOnly: true,
    stub: true,
  };
}
