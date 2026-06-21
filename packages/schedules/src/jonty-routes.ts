/**
 * Parse Jonty / FlightsFrom airport-indexed route JSON into eligible RoutePair rows.
 */

export interface JontyAirportEntry {
  iata?: string;
  routes?: Array<{
    iata: string;
    carriers?: Array<{ iata: string; name?: string }>;
  }>;
}

export interface JontyRoutePair {
  carrier: string;
  from: string;
  to: string;
  source: string;
}

export interface ParseJontyResult {
  pairs: JontyRoutePair[];
  stats: {
    airportCount: number;
    pairCount: number;
    carrierCounts: Record<string, number>;
  };
}

export const FLIGHTSFROM_WEEKLY_SOURCE = "flightsfrom-weekly";

export const JONTY_VENDOR_FILENAME = "jonty-airline_routes.json";

export function isValidIata(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

export function isValidCarrierCode(code: string): boolean {
  return /^[A-Z0-9]{2}$/.test(code);
}

export function parseJontyRoutes(
  data: Record<string, JontyAirportEntry>,
  eligibleCarriers: Set<string>,
  options?: { source?: string; carrierFilter?: Set<string> },
): ParseJontyResult {
  const source = options?.source ?? FLIGHTSFROM_WEEKLY_SOURCE;
  const carrierFilter = options?.carrierFilter;
  const seen = new Set<string>();
  const pairs: JontyRoutePair[] = [];
  const carrierCounts: Record<string, number> = {};

  for (const [fromKey, airport] of Object.entries(data)) {
    const from = (airport.iata ?? fromKey).toUpperCase();
    if (!isValidIata(from)) continue;

    for (const dest of airport.routes ?? []) {
      const to = dest.iata?.toUpperCase();
      if (!to || !isValidIata(to)) continue;

      for (const c of dest.carriers ?? []) {
        const carrier = c.iata?.toUpperCase();
        if (!carrier || !isValidCarrierCode(carrier)) continue;
        if (carrierFilter) {
          if (!carrierFilter.has(carrier)) continue;
        } else if (!eligibleCarriers.has(carrier)) {
          continue;
        }

        const key = `${from}-${to}-${carrier}`;
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push({ carrier, from, to, source });
        carrierCounts[carrier] = (carrierCounts[carrier] ?? 0) + 1;
      }
    }
  }

  return {
    pairs,
    stats: {
      airportCount: Object.keys(data).length,
      pairCount: pairs.length,
      carrierCounts,
    },
  };
}
