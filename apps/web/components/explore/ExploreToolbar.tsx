"use client";

import { useEffect, useState } from "react";
import type { MapStyleMode } from "@oneworld-explorer/core";
import { MAP_STYLE_LABELS } from "../../lib/globe/map-style";
import { ChainModeControl } from "../globe/ChainModeControl";

interface SearchHit {
  iata: string;
  city: string;
  name?: string;
}

export interface ExploreToolbarProps {
  chainMode: boolean;
  onChainModeChange: (v: boolean) => void;
  mapStyleMode: MapStyleMode;
  onMapStyleModeChange: (m: MapStyleMode) => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  onExpand: () => void;
  onSearchSelect: (iata: string) => void;
}

export function ExploreToolbar({
  chainMode,
  onChainModeChange,
  mapStyleMode,
  onMapStyleModeChange,
  zoom,
  onZoomChange,
  onExpand,
  onSearchSelect,
}: ExploreToolbarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    void fetch(`/api/airports/search?q=${encodeURIComponent(query)}&limit=6`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((body: { airports?: SearchHit[]; results?: SearchHit[] }) =>
        setSuggestions(body.airports ?? body.results ?? []),
      )
      .catch(() => setSuggestions([]));
    return () => controller.abort();
  }, [query]);

  const mapLabel = MAP_STYLE_LABELS[mapStyleMode] ?? "Continents";
  const mapOptions = (Object.keys(MAP_STYLE_LABELS) as MapStyleMode[]).map((id) => ({
    id,
    label: MAP_STYLE_LABELS[id],
  }));

  return (
    <div className="flex flex-col gap-2" data-testid="explore-toolbar">
      <div className="flex min-h-[48px] flex-wrap items-center gap-2">
        <ChainModeControl chainMode={chainMode} onChange={onChainModeChange} />

        <div className="relative">
          <button
            type="button"
            data-testid="globe-map-style-toggle"
            className="rounded-md border border-surface-border bg-surface-card px-2 py-1 text-[11px] text-surface-muted hover:text-slate-200"
            onClick={() => setMapOpen((v) => !v)}
          >
            Map: {mapLabel} ▾
          </button>
          {mapOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 min-w-[160px] rounded-md border border-surface-border bg-surface-card p-1 shadow-lg">
              {mapOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`globe-map-style-${opt.id}`}
                  className={`block w-full rounded px-2 py-1 text-left text-[11px] ${
                    mapStyleMode === opt.id ? "bg-blue-950/50 text-blue-200" : "text-surface-muted"
                  }`}
                  onClick={() => {
                    onMapStyleModeChange(opt.id);
                    setMapOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="flex items-center gap-1 rounded-md border border-surface-border bg-surface-card px-1"
          data-testid="globe-zoom-controls"
        >
          <button
            type="button"
            data-testid="globe-zoom-out"
            className="px-2 py-1 text-xs text-surface-muted hover:text-slate-200"
            onClick={() => onZoomChange(Math.max(0.6, zoom - 0.15))}
          >
            −
          </button>
          <span className="min-w-[2.5rem] text-center text-[10px] text-surface-muted">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            data-testid="globe-zoom-in"
            className="px-2 py-1 text-xs text-surface-muted hover:text-slate-200"
            onClick={() => onZoomChange(Math.min(2.5, zoom + 0.15))}
          >
            +
          </button>
        </div>

        <button
          type="button"
          data-testid="globe-fullscreen-expand"
          className="rounded-md border border-surface-border bg-surface-card px-2 py-1 text-[11px] text-surface-muted hover:text-slate-200"
          onClick={onExpand}
        >
          Expand
        </button>

        <div className="relative min-w-[140px] flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search airport…"
            data-testid="globe-airport-search"
            className="w-full rounded-md border border-surface-border bg-surface-card px-2 py-1.5 text-xs text-slate-200 placeholder:text-surface-muted"
          />
          {suggestions.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full z-30 mt-1 max-h-40 overflow-y-auto rounded-md border border-surface-border bg-surface-card py-1 shadow-lg"
              data-testid="globe-search-suggestions"
            >
              {suggestions.map((s) => (
                <li key={s.iata}>
                  <button
                    type="button"
                    data-testid={`globe-search-option-${s.iata}`}
                    className="block w-full px-2 py-1 text-left text-xs hover:bg-blue-950/40"
                    onClick={() => {
                      onSearchSelect(s.iata);
                      setQuery("");
                      setSuggestions([]);
                    }}
                  >
                    <span className="font-mono font-semibold">{s.iata}</span>
                    <span className="ml-2 text-surface-muted">{s.city}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
