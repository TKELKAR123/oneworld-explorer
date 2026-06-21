"use client";

import type { MapStyleMode } from "@oneworld-explorer/core";
import { MAP_STYLE_LABELS, TC_COLORS } from "../../lib/globe/map-style";
import { continentColor } from "../../lib/continent-labels";

export interface MapStyleToggleProps {
  mode: MapStyleMode;
  onChange: (mode: MapStyleMode) => void;
}

const MODES: MapStyleMode[] = ["continents", "tc-zones", "countries", "minimal"];

export function MapStyleToggle({ mode, onChange }: MapStyleToggleProps) {
  return (
    <div className="flex flex-col gap-1" data-testid="globe-map-style-toggle">
      <span className="text-[10px] font-medium text-slate-400">Map style</span>
      <div className="flex flex-wrap gap-1">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            data-testid={`globe-map-style-${m}`}
            className={`rounded px-2 py-0.5 text-[10px] ${
              mode === m
                ? "bg-slate-600 text-white"
                : "border border-surface-border text-surface-muted hover:text-slate-200"
            }`}
            onClick={() => onChange(m)}
          >
            {MAP_STYLE_LABELS[m]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-[9px] text-surface-muted" data-testid="globe-map-legend">
        {mode === "continents" &&
          (["north-america", "europe-middle-east", "asia", "africa", "south-america", "south-west-pacific"] as const).map(
            (c) => (
              <span key={c} className="flex items-center gap-1">
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ backgroundColor: continentColor(c) }}
                />
                {c.split("-")[0]}
              </span>
            ),
          )}
        {mode === "tc-zones" &&
          (["TC1", "TC2", "TC3"] as const).map((tc) => (
            <span key={tc} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ backgroundColor: TC_COLORS[tc] }}
              />
              {tc}
            </span>
          ))}
        {mode === "countries" && <span>Country borders · continent tint</span>}
        {mode === "minimal" && <span>Land outlines only</span>}
      </div>
    </div>
  );
}
