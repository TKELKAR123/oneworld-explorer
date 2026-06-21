import type { NormalizedFlight, ScheduleProvider, ScheduleSearchParams } from "./provider.js";
import { normalizeAviationstackResponse } from "./normalize.js";

const BASE_URL = "https://api.aviationstack.com/v1/flights";
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_PAGES = 3;

export class AviationstackError extends Error {
  constructor(
    message: string,
    readonly code: "MISSING_KEY" | "QUOTA_EXCEEDED" | "TIMEOUT" | "HTTP_ERROR" | "API_ERROR",
  ) {
    super(message);
    this.name = "AviationstackError";
  }
}

export interface AviationstackFetchOptions {
  apiKey?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export async function fetchAviationstackFlights(
  params: ScheduleSearchParams,
  options: AviationstackFetchOptions = {},
): Promise<unknown> {
  const apiKey = options.apiKey ?? process.env.AVIATIONSTACK_ACCESS_KEY;
  if (!apiKey) {
    throw new AviationstackError("AVIATIONSTACK_ACCESS_KEY not configured", "MISSING_KEY");
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const from = params.from.toUpperCase();
  const to = params.to.toUpperCase();
  const allData: unknown[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(BASE_URL);
    url.searchParams.set("access_key", apiKey);
    url.searchParams.set("dep_iata", from);
    url.searchParams.set("arr_iata", to);
    url.searchParams.set("flight_date", params.date);
    url.searchParams.set("limit", "100");
    url.searchParams.set("offset", String(page * 100));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetchImpl(url, { signal: controller.signal });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new AviationstackError("Aviationstack request timed out", "TIMEOUT");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    const body = (await response.json()) as {
      error?: { code?: string; message?: string; type?: string };
      data?: unknown[];
      pagination?: { count?: number; total?: number; offset?: number; limit?: number };
    };

    if (!response.ok || body.error) {
      const message = body.error?.message ?? `Aviationstack HTTP ${response.status}`;
      if (/quota|limit|subscription|exceeded/i.test(message)) {
        throw new AviationstackError(message, "QUOTA_EXCEEDED");
      }
      throw new AviationstackError(message, "API_ERROR");
    }

    const pageData = body.data ?? [];
    allData.push(...pageData);

    const pagination = body.pagination;
    if (!pagination?.total || allData.length >= pagination.total) break;
    if (pageData.length < (pagination.limit ?? 100)) break;
  }

  return { data: allData };
}

/** Aviationstack primary adapter — `/v1/flights` by dep/arr/date. */
export class AviationstackProvider implements ScheduleProvider {
  readonly name = "aviationstack";

  constructor(
    private readonly apiKey?: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async searchRoute(params: ScheduleSearchParams): Promise<NormalizedFlight[]> {
    const raw = await fetchAviationstackFlights(params, {
      apiKey: this.apiKey,
      fetchImpl: this.fetchImpl,
    });
    return normalizeAviationstackResponse(raw);
  }

  async healthCheck(): Promise<boolean> {
    const key = this.apiKey ?? process.env.AVIATIONSTACK_ACCESS_KEY;
    return Boolean(key);
  }
}

export function createAviationstackProvider(apiKey?: string): AviationstackProvider {
  return new AviationstackProvider(apiKey);
}
