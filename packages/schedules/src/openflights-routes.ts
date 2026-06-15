/** Static route-pair index from OpenFlights routes.dat (v0.2 bootstrap). */

export interface RoutePair {
  carrier: string;
  from: string;
  to: string;
  source: string;
}

export function loadOpenFlightsRoutes(): RoutePair[] {
  return [];
}

export function routeExists(
  _routes: RoutePair[],
  _from: string,
  _to: string,
  _carriers?: string[],
): boolean {
  return false;
}
