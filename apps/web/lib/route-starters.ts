import type { TravelClass } from "@oneworld-explorer/core";

export interface RouteStarter {
  id: string;
  label: string;
  description: string;
  stops: string[];
  legTypes: ("flight" | "surface")[];
  travelClass: TravelClass;
}

export const ROUTE_STARTERS: RouteStarter[] = [
  {
    id: "blank",
    label: "Start from scratch",
    description: "Empty itinerary — pick your origin on the globe",
    stops: [],
    legTypes: [],
    travelClass: "economy",
  },
  {
    id: "SC-001",
    label: "Classic eastbound RTW",
    description: "JFK → Europe → Middle East → Asia → Australia → US → home",
    stops: ["JFK", "LHR", "DOH", "SIN", "SYD", "LAX", "JFK"],
    legTypes: ["flight", "flight", "flight", "flight", "flight", "flight"],
    travelClass: "economy",
  },
  {
    id: "SC-079",
    label: "Westbound from Sydney",
    description: "SYD → US → Europe → Asia → home",
    stops: ["SYD", "LAX", "LHR", "SIN", "SYD"],
    legTypes: ["flight", "flight", "flight", "flight"],
    travelClass: "economy",
  },
];

export function getRouteStarter(id: string): RouteStarter | undefined {
  return ROUTE_STARTERS.find((s) => s.id === id);
}
