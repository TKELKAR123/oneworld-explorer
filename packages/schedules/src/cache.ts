import type { NormalizedFlight, ScheduleSearchParams } from "./provider.js";

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry {
  flights: NormalizedFlight[];
  expiresAt: number;
}

export class ScheduleCache {
  private store = new Map<string, CacheEntry>();

  private key(params: ScheduleSearchParams): string {
    return `${params.from}:${params.to}:${params.date}`;
  }

  get(params: ScheduleSearchParams): NormalizedFlight[] | null {
    const entry = this.store.get(this.key(params));
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.flights;
  }

  set(params: ScheduleSearchParams, flights: NormalizedFlight[], ttlMs = DEFAULT_TTL_MS): void {
    this.store.set(this.key(params), { flights, expiresAt: Date.now() + ttlMs });
  }
}

export function createScheduleCache(): ScheduleCache {
  return new ScheduleCache();
}
