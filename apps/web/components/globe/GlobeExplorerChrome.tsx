"use client";

import { useEffect, useState } from "react";
import type { MapStyleMode } from "@oneworld-explorer/core";
import { continentLabel } from "../../lib/continent-labels";
import type { InspirationRoute } from "./GlobeExplorer";
import { ChainModeControl } from "./ChainModeControl";
import { MapStyleToggle } from "./MapStyleToggle";

interface SearchHit {
  iata: string;
  city: string;
  continent?: string;
}

const CONTINENT_FILTERS = [
  { id: null, label: "All" },
  { id: "north-america", label: "Americas" },
  { id: "europe-middle-east", label: "Europe & ME" },
  { id: "asia", label: "Asia" },
  { id: "africa", label: "Africa" },
  { id: "southwest-pacific", label: "SW Pacific" },
] as const;

export interface GlobeExplorerChromeProps {
  continentFilter: string | null;
  onContinentFilterChange: (c: string | null) => void;
  showSpine: boolean;
  onShowSpineChange: (v: boolean) => void;
  showInspiration: boolean;
  onShowInspirationChange: (v: boolean) => void;
  inspirationRoutes: InspirationRoute[];
  onLoadInspiration?: (id: string) => void;
  onSearchSelect: (iata: string) => void;
  exploreAnchorIata: string | null;
  continentCount?: number;
  chainMode?: boolean;
  onChainModeChange?: (v: boolean) => void;
  mapStyleMode: MapStyleMode;
  onMapStyleModeChange: (m: MapStyleMode) => void;
  zoom?: number;
  onZoomChange?: (z: number) => void;
  previewFutureMembers?: boolean;
  onPreviewFutureMembersChange?: (v: boolean) => void;
}

export function GlobeExplorerChrome({
  continentFilter,
  onContinentFilterChange,
  showSpine,
  onShowSpineChange,
  showInspiration,
  onShowInspirationChange,
  inspirationRoutes,
  onLoadInspiration,
  onSearchSelect,
  exploreAnchorIata,
  continentCount,
  chainMode = true,
  onChainModeChange,
  mapStyleMode,
  onMapStyleModeChange,
  zoom = 1,
  onZoomChange,
  previewFutureMembers = false,
  onPreviewFutureMembersChange,
}: GlobeExplorerChromeProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);

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
      .then((body: { airports: SearchHit[] }) => setSuggestions(body.airports ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [query]);

  return (
    <div className="space-y-3" data-testid="globe-explorer-chrome">
      {onChainModeChange && (
        <ChainModeControl chainMode={chainMode} onChange={onChainModeChange} />
      )}

      <div className="flex flex-wrap items-start gap-3">
        <MapStyleToggle mode={mapStyleMode} onChange={onMapStyleModeChange} />
        {onZoomChange && (
          <div className="ml-auto flex items-center gap-1" data-testid="globe-zoom-controls">
            <button
              type="button"
              className="rounded border border-surface-border px-2 py-0.5 text-[10px]"
              data-testid="globe-zoom-out"
              onClick={() => onZoomChange(Math.max(0.6, zoom - 0.35))}
            >
              −
            </button>
            <span className="text-[10px] tabular-nums">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className="rounded border border-surface-border px-2 py-0.5 text-[10px]"
              data-testid="globe-zoom-in"
              onClick={() => onZoomChange(Math.min(2.5, zoom + 0.35))}
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {continentCount != null && continentCount > 0 && (
          <span className="text-caption text-slate-300" data-testid="globe-continent-progress">
            {continentCount} continent{continentCount === 1 ? "" : "s"} on route
            {continentCount < 4 ? " — need 4 for classic RTW shape" : ""}
          </span>
        )}
        {exploreAnchorIata && (
          <span className="rounded bg-blue-950/50 px-2 py-0.5 text-[10px] text-blue-200">
            Next hops from {exploreAnchorIata}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="search"
          data-testid="globe-airport-search"
          placeholder="Search airport to fly to…"
          className="w-full rounded-lg border border-surface-border bg-surface-bg px-3 py-2 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul
            className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-surface-border bg-surface-card shadow-lg"
            data-testid="globe-search-suggestions"
          >
            {suggestions.map((a) => (
              <li key={a.iata}>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-border/40"
                  data-testid={`globe-search-option-${a.iata}`}
                  onClick={() => {
                    onSearchSelect(a.iata);
                    setQuery("");
                  }}
                >
                  <span className="font-mono font-semibold">{a.iata}</span> — {a.city}
                  {a.continent ? ` (${continentLabel(a.continent as never)})` : ""}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {exploreAnchorIata && (
        <div className="flex flex-wrap gap-1">
          {CONTINENT_FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              data-testid={`globe-filter-${f.id ?? "all"}`}
              className={`rounded px-2 py-0.5 text-[10px] ${
                continentFilter === f.id
                  ? "bg-slate-600 text-white"
                  : "border border-surface-border text-surface-muted"
              }`}
              onClick={() => onContinentFilterChange(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <details className="rounded-lg border border-surface-border/60 bg-surface-card/20 px-3 py-2">
        <summary className="cursor-pointer text-[10px] font-medium text-slate-400">
          Map overlays
        </summary>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-surface-muted">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showSpine}
              onChange={(e) => onShowSpineChange(e.target.checked)}
              data-testid="globe-spine-toggle"
            />
            Hub backbone
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showInspiration}
              onChange={(e) => onShowInspirationChange(e.target.checked)}
              data-testid="globe-inspiration-toggle"
            />
            Golden routes
          </label>
          {showInspiration &&
            inspirationRoutes.map((r) => (
              <button
                key={r.id}
                type="button"
                className="text-violet-300 hover:underline"
                data-testid={`inspiration-load-${r.id}`}
                onClick={() => onLoadInspiration?.(r.id)}
              >
                Load {r.label}
              </button>
            ))}
          {onPreviewFutureMembersChange && (
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={previewFutureMembers}
                onChange={(e) => onPreviewFutureMembersChange(e.target.checked)}
                data-testid="preview-future-members-toggle"
              />
              Preview PR routes
            </label>
          )}
        </div>
      </details>
    </div>
  );
}
