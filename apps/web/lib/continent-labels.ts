import type { Continent } from "@oneworld-explorer/core";

export const CONTINENT_LABELS: Record<Continent, string> = {
  "europe-middle-east": "Europe / Middle East",
  africa: "Africa",
  asia: "Asia",
  "south-west-pacific": "South West Pacific",
  "north-america": "North America",
  "south-america": "South America",
};

export const CONTINENT_COLORS: Record<Continent, string> = {
  "europe-middle-east": "#6366f1",
  africa: "#eab308",
  asia: "#22c55e",
  "south-west-pacific": "#06b6d4",
  "north-america": "#3b82f6",
  "south-america": "#f97316",
};

export function continentLabel(continent: Continent | string): string {
  return CONTINENT_LABELS[continent as Continent] ?? continent;
}

export function continentColor(continent: Continent | string): string {
  return CONTINENT_COLORS[continent as Continent] ?? "#94a3b8";
}
