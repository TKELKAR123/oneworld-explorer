import type { Continent, MapStyleMode, TrafficZone } from "@oneworld-explorer/core";
import type { CountryAtlasEntry } from "@oneworld-explorer/core";
import { continentColor } from "../continent-labels";

export const TC_COLORS: Record<TrafficZone, string> = {
  TC1: "#3b82f6",
  TC2: "#6366f1",
  TC3: "#22c55e",
};

export const MAP_STYLE_LABELS: Record<MapStyleMode, string> = {
  continents: "Continents",
  "tc-zones": "TC zones",
  countries: "Countries",
  minimal: "Minimal",
};

export interface PolygonStyle {
  capColor: string;
  sideColor: string;
  strokeColor: string;
  strokeWidth: number;
  altitude: number;
}

export interface PathStyle {
  color: string;
  strokeWidth: number;
  visible: boolean;
}

function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function styleCountryPolygon(
  entry: Pick<CountryAtlasEntry, "explorerContinent" | "trafficZone">,
  mode: MapStyleMode,
): PolygonStyle {
  const baseAlt = 0.004;

  switch (mode) {
    case "continents": {
      const hex = continentColor(entry.explorerContinent as Continent);
      return {
        capColor: rgba(hex, 0.72),
        sideColor: rgba(hex, 0.35),
        strokeColor: rgba(hex, 0.9),
        strokeWidth: 0.3,
        altitude: baseAlt,
      };
    }
    case "tc-zones": {
      const hex = TC_COLORS[entry.trafficZone];
      return {
        capColor: rgba(hex, 0.72),
        sideColor: rgba(hex, 0.35),
        strokeColor: "rgba(255,255,255,0.15)",
        strokeWidth: 0.3,
        altitude: baseAlt,
      };
    }
    case "countries": {
      const hex = continentColor(entry.explorerContinent as Continent);
      return {
        capColor: rgba(hex, 0.45),
        sideColor: rgba(hex, 0.2),
        strokeColor: "rgba(71,85,105,0.6)",
        strokeWidth: 0.4,
        altitude: baseAlt * 0.8,
      };
    }
    case "minimal":
    default:
      return {
        capColor: "rgba(30,41,59,0.9)",
        sideColor: "rgba(30,41,59,0.5)",
        strokeColor: "rgba(51,65,85,0.8)",
        strokeWidth: 0.5,
        altitude: baseAlt * 0.6,
      };
  }
}

export function styleGraticule(mode: MapStyleMode): PathStyle {
  return {
    color: "rgba(51,65,85,0.25)",
    strokeWidth: 0.5,
    visible: mode !== "minimal",
  };
}

export function nextMapStyleMode(current: MapStyleMode): MapStyleMode {
  const order: MapStyleMode[] = ["continents", "tc-zones", "countries", "minimal"];
  const i = order.indexOf(current);
  return order[(i + 1) % order.length]!;
}
