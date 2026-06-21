import type { NormalizedFlight, ScheduleProvider, ScheduleSearchParams } from "./provider.js";
import { normalizeAeroDataBoxResponse } from "./normalize.js";

const DEFAULT_TIMEOUT_MS = 15_000;

export class AeroDataBoxError extends Error {
  constructor(
    message: string,
    readonly code: "MISSING_KEY" | "QUOTA_EXCEEDED" | "TIMEOUT" | "HTTP_ERROR" | "API_ERROR",
  ) {
    super(message);
    this.name = "AeroDataBoxError";
  }
}

export interface AeroDataBoxFetchOptions {
  apiKey?: string;
  host?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

function dayBounds(date: string): Array<{ fromLocal: string; toLocal: string }> {
  return [
    { fromLocal: `${date}T00:00`, toLocal: `${date}T11:59` },
    { fromLocal: `${date}T12:00`, toLocal: `${date}T23:59` },
  ];
}

export async function fetchAeroDataBoxFlights(
  params: ScheduleSearchParams,
  options: AeroDataBoxFetchOptions = {},
): Promise<unknown> {
  const apiKey = options.apiKey ?? process.env.AERODATABOX_RAPIDAPI_KEY;
  const host = options.host ?? process.env.AERODATABOX_RAPIDAPI_HOST ?? "aerodatabox.p.rapidapi.com";
  if (!apiKey) {
    throw new AeroDataBoxError("AERODATABOX_RAPIDAPI_KEY not configured", "MISSING_KEY");
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const from = params.from.toUpperCase();
  const to = params.to.toUpperCase();
  const departures: unknown[] = [];

  for (const { fromLocal, toLocal } of dayBounds(params.date)) {
    const url = `https://${host}/flights/airports/iata/${from}/${fromLocal}/${toLocal}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetchImpl(url, {
        signal: controller.signal,
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": host,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new AeroDataBoxError("AeroDataBox request timed out", "TIMEOUT");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    const body = (await response.json()) as {
      message?: string;
      departures?: unknown[];
      arrivals?: unknown[];
    };

    if (!response.ok) {
      const message = body.message ?? `AeroDataBox HTTP ${response.status}`;
      if (response.status === 429 || /quota|limit|exceeded/i.test(message)) {
        throw new AeroDataBoxError(message, "QUOTA_EXCEEDED");
      }
      throw new AeroDataBoxError(message, "API_ERROR");
    }

    departures.push(...(body.departures ?? []));
  }

  const filtered = departures.filter((flight) => {
    const arrival = (flight as { arrival?: { airport?: { iata?: string } } }).arrival?.airport?.iata;
    return arrival?.toUpperCase() === to;
  });

  return { departures: filtered, route: { from, to, date: params.date } };
}

/** AeroDataBox secondary adapter — RapidAPI FIDS filtered to route. */
export class AeroDataBoxProvider implements ScheduleProvider {
  readonly name = "aerodatabox";

  constructor(
    private readonly apiKey?: string,
    private readonly host?: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async searchRoute(params: ScheduleSearchParams): Promise<NormalizedFlight[]> {
    const raw = await fetchAeroDataBoxFlights(params, {
      apiKey: this.apiKey,
      host: this.host,
      fetchImpl: this.fetchImpl,
    });
    return normalizeAeroDataBoxResponse(raw);
  }

  async healthCheck(): Promise<boolean> {
    const key = this.apiKey ?? process.env.AERODATABOX_RAPIDAPI_KEY;
    return Boolean(key);
  }
}

export function createAeroDataBoxProvider(apiKey?: string, host?: string): AeroDataBoxProvider {
  return new AeroDataBoxProvider(apiKey, host);
}
