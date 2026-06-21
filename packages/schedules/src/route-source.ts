/**
 * Route index metadata — upstream fetch date and API source labels.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FLIGHTSFROM_WEEKLY_SOURCE } from "./jonty-routes.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const metaPath = join(repoRoot, "data/routes-source.meta.json");

export const ROUTE_NETWORK_SOURCE = FLIGHTSFROM_WEEKLY_SOURCE;
export const ROUTE_NETWORK_SOURCE_PREVIEW = `${FLIGHTSFROM_WEEKLY_SOURCE}+preview`;

export interface RouteSourceMeta {
  source: string;
  upstreamUrl: string;
  fetchedAt: string;
  sha256?: string;
  airportCount?: number;
  eligiblePairCount?: number;
  builtAt?: string;
}

let cachedMeta: RouteSourceMeta | null | undefined;

export function loadRouteSourceMeta(): RouteSourceMeta | null {
  if (cachedMeta !== undefined) return cachedMeta;
  if (!existsSync(metaPath)) {
    cachedMeta = null;
    return cachedMeta;
  }
  cachedMeta = JSON.parse(readFileSync(metaPath, "utf-8")) as RouteSourceMeta;
  return cachedMeta;
}

export function routeIndexAsOf(): string {
  const meta = loadRouteSourceMeta();
  if (meta?.fetchedAt) {
    return meta.fetchedAt.slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export const NETWORK_DISCLAIMER =
  "Weekly FlightsFrom-derived route index — may not reflect seasonal service or codeshares on your date. Verify timetables before booking.";
