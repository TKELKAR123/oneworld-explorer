import type { TravelClass } from "@oneworld-explorer/core";

const GOOGLE_FLIGHTS_BASE = "https://www.google.com/travel/flights";
const FLIGHTS_FROM_BASE = "https://www.flightsfrom.com";
const FLIGHT_CONNECTIONS_BASE = "https://www.flightconnections.com";
export const ONEWORLD_RTW_BOOK = "https://rtw.oneworld.com/";

function classSuffix(travelClass?: TravelClass): string {
  switch (travelClass) {
    case "business":
      return "+business+class";
    case "first":
      return "+first+class";
    case "premium-economy":
      return "+premium+economy";
    default:
      return "";
  }
}

/** Primary Tier 4 — natural-language deep link (no API). */
export function googleFlightsLeg(
  from: string,
  to: string,
  date: string,
  travelClass?: TravelClass,
): string {
  const q = encodeURIComponent(
    `Flights from ${from.toUpperCase()} to ${to.toUpperCase()} on ${date}${classSuffix(travelClass) ? ` ${classSuffix(travelClass).replace(/\+/g, " ")}` : ""}`,
  );
  return `${GOOGLE_FLIGHTS_BASE}?q=${q}&hl=en`;
}

/** Weekly timetable inspiration — typical departure times on site. */
export function flightsFromLeg(from: string, to: string): string {
  return `${FLIGHTS_FROM_BASE}/${from.toUpperCase()}-${to.toUpperCase()}`;
}

/** Route map + alliance filter on their site (best-effort URL). */
export function flightConnectionsLeg(from: string, to: string): string {
  const f = from.toLowerCase();
  const t = to.toLowerCase();
  return `${FLIGHT_CONNECTIONS_BASE}/?origin=${f}&destination=${t}`;
}

export function oneworldRtwBook(): string {
  return ONEWORLD_RTW_BOOK;
}
