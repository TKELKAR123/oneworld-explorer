import type { HubConnection } from "@oneworld-explorer/schedules";
import { carrierName } from "./carrier-labels";

const HUB_CITIES: Record<string, string> = {
  SIN: "Singapore",
  DOH: "Doha",
  LHR: "London",
  SYD: "Sydney",
  HKG: "Hong Kong",
  DXB: "Dubai",
  NRT: "Tokyo",
  HND: "Tokyo",
  ICN: "Seoul",
  BKK: "Bangkok",
  KUL: "Kuala Lumpur",
  MAD: "Madrid",
  BCN: "Barcelona",
  ORD: "Chicago",
  DFW: "Dallas",
  LAX: "Los Angeles",
  JFK: "New York",
  MIA: "Miami",
};

export interface HubInsertAction {
  hub: string;
  hubCity: string;
  label: string;
  insertLabel: string;
  legIndex: number;
  from: string;
  to: string;
  kind: "insert_stop";
  insertAt: number;
  toHub: string;
}

function hubCityName(hub: string): string {
  return HUB_CITIES[hub.toUpperCase()] ?? hub.toUpperCase();
}

function formatLegCarriers(codes: string[]): string {
  return codes.slice(0, 2).join(" → ") || "—";
}

export function hubActionsFromNetwork(
  legIndex: number,
  from: string,
  to: string,
  suggestedHubs: HubConnection[],
): HubInsertAction[] {
  return suggestedHubs.map((h) => {
    const hub = h.hub.toUpperCase();
    const first = h.firstLegCarriers.slice(0, 2).map(carrierName).join("/");
    const second = h.secondLegCarriers.slice(0, 2).map(carrierName).join("/");
    return {
      hub,
      hubCity: hubCityName(hub),
      label: `Via ${hubCityName(hub)} — ${first || formatLegCarriers(h.firstLegCarriers)} then ${second || formatLegCarriers(h.secondLegCarriers)}`,
      insertLabel: `Insert ${hubCityName(hub)} between ${from.toUpperCase()} and ${to.toUpperCase()}`,
      legIndex,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      kind: "insert_stop",
      insertAt: legIndex + 1,
      toHub: hub,
    };
  });
}
