import type { NormalizedFlight } from "./provider.js";

const PROVIDER_AS = "aviationstack";
const PROVIDER_ADB = "aerodatabox";

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function isoTime(value: unknown): string | undefined {
  const text = asString(value);
  if (!text) return undefined;
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? text : new Date(parsed).toISOString();
}

function carrierFromFlightNumber(flightNumber: string): string | undefined {
  const match = flightNumber.match(/^([A-Z0-9]{2})/);
  return match?.[1];
}

/** Map provider-specific JSON to canonical FlightInstance shape. */
export function normalizeAviationstackResponse(raw: unknown): NormalizedFlight[] {
  const root = asRecord(raw);
  const rows = Array.isArray(root?.data) ? root.data : [];
  const fetchedAt = new Date().toISOString();
  const flights: NormalizedFlight[] = [];

  for (const row of rows) {
    const item = asRecord(row);
    if (!item) continue;

    const airline = asRecord(item.airline);
    const flight = asRecord(item.flight);
    const departure = asRecord(item.departure);
    const arrival = asRecord(item.arrival);
    if (!airline || !flight || !departure || !arrival) continue;

    const marketingCarrier = asString(airline.iata)?.toUpperCase();
    const flightNumber = asString(flight.iata) ?? asString(flight.number);
    const depPoint = asString(departure.iata)?.toUpperCase();
    const arrPoint = asString(arrival.iata)?.toUpperCase();
    const depTime = isoTime(departure.scheduled ?? departure.estimated ?? departure.actual);
    const arrTime = isoTime(arrival.scheduled ?? arrival.estimated ?? arrival.actual);

    if (!marketingCarrier || !flightNumber || !depPoint || !arrPoint || !depTime || !arrTime) {
      continue;
    }

    const codeshared = asRecord(flight.codeshared);
    const operatingFromApi = asString(codeshared?.airline_iata)?.toUpperCase();
    const operatingCarrier = operatingFromApi ?? marketingCarrier;

    flights.push({
      marketingCarrier,
      operatingCarrier,
      operatingCarrierSource: operatingFromApi ? "api" : "unknown",
      flightNumber: flightNumber.toUpperCase(),
      departure: {
        point: depPoint,
        time: depTime,
        terminal: asString(departure.terminal),
      },
      arrival: {
        point: arrPoint,
        time: arrTime,
        terminal: asString(arrival.terminal),
      },
      stops: [],
      provider: PROVIDER_AS,
      fetchedAt,
    });
  }

  return flights;
}

function adbScheduledTime(node: unknown): string | undefined {
  const record = asRecord(node);
  const scheduled = asRecord(record?.scheduledTime);
  return isoTime(scheduled?.utc ?? scheduled?.local ?? record?.scheduledTimeUtc);
}

export function normalizeAeroDataBoxResponse(raw: unknown): NormalizedFlight[] {
  const root = asRecord(raw);
  const rows = Array.isArray(root?.departures) ? root.departures : [];
  const fetchedAt = new Date().toISOString();
  const flights: NormalizedFlight[] = [];

  for (const row of rows) {
    const item = asRecord(row);
    if (!item) continue;

    const airline = asRecord(item.airline);
    const operatingAirline = asRecord(item.operatingAirline ?? item.operator);
    const departure = asRecord(item.departure);
    const arrival = asRecord(item.arrival);
    const depAirport = asRecord(departure?.airport);
    const arrAirport = asRecord(arrival?.airport);
    if (!departure || !arrival || !depAirport || !arrAirport) continue;

    const marketingCarrier =
      asString(airline?.iata)?.toUpperCase() ??
      asString(item.marketingAirline)?.toUpperCase();
    const operatingCarrier =
      asString(operatingAirline?.iata)?.toUpperCase() ??
      asString(item.operatingCarrier)?.toUpperCase();
    const number = asString(item.number)?.replace(/\s+/g, "") ?? asString(item.flightNumber);
    const flightNumber =
      number ??
      (marketingCarrier && asString(item.number)
        ? `${marketingCarrier}${asString(item.number)?.replace(/\D/g, "") ?? ""}`
        : undefined);
    const depPoint = asString(depAirport.iata)?.toUpperCase();
    const arrPoint = asString(arrAirport.iata)?.toUpperCase();
    const depTime = adbScheduledTime(departure);
    const arrTime = adbScheduledTime(arrival);

    const resolvedMarketing =
      marketingCarrier ?? (flightNumber ? carrierFromFlightNumber(flightNumber.toUpperCase()) : undefined);
    if (!resolvedMarketing || !flightNumber || !depPoint || !arrPoint || !depTime || !arrTime) {
      continue;
    }

    const resolvedOperating = operatingCarrier ?? resolvedMarketing;

    flights.push({
      marketingCarrier: resolvedMarketing,
      operatingCarrier: resolvedOperating,
      operatingCarrierSource: operatingCarrier ? "api" : "unknown",
      flightNumber: flightNumber.toUpperCase(),
      departure: {
        point: depPoint,
        time: depTime,
        terminal: asString(departure.terminal),
      },
      arrival: {
        point: arrPoint,
        time: arrTime,
        terminal: asString(arrival.terminal),
      },
      stops: [],
      codeshareStatus: asString(item.codeshareStatus),
      provider: PROVIDER_ADB,
      fetchedAt,
    });
  }

  return flights;
}

export function inferOperatingCarrier(
  marketingCarrier: string,
  _flightNumber: string,
): { operatingCarrier: string; source: "inferred" | "unknown" } {
  return { operatingCarrier: marketingCarrier, source: "unknown" };
}
