"use client";

import { continentLabel } from "../../lib/continent-labels";
import { carrierName } from "../../lib/carrier-labels";
import { useExplore } from "../../lib/explore/ExploreProvider";
import { Button } from "../ui";

const CONTINENT_FILTERS = [
  { id: null, label: "All" },
  { id: "north-america", label: "Americas" },
  { id: "europe-middle-east", label: "Europe & ME" },
  { id: "asia", label: "Asia" },
  { id: "africa", label: "Africa" },
  { id: "southwest-pacific", label: "SW Pacific" },
] as const;

export interface NextHopsPanelProps {
  chainMode: boolean;
  continentFilter: string | null;
  onContinentFilterChange: (c: string | null) => void;
  onAdd: (iata: string) => void;
  onReanchor: (iata: string) => void;
}

export function NextHopsPanel({
  chainMode,
  continentFilter,
  onContinentFilterChange,
  onAdd,
  onReanchor,
}: NextHopsPanelProps) {
  const {
    anchorIata,
    destinations,
    destinationsLoading,
    total,
    truncated,
    hoverDest,
    setHoverDest,
  } = useExplore();

  if (!anchorIata) {
    return (
      <p className="rounded-lg border border-dashed border-surface-border px-3 py-4 text-center text-xs text-surface-muted">
        Search or click an airport to see next hops
      </p>
    );
  }

  function handleRowClick(iata: string) {
    if (chainMode) onAdd(iata);
    else onReanchor(iata);
  }

  return (
    <div
      className="max-h-[200px] overflow-y-auto rounded-lg border border-surface-border bg-surface-card/50 p-3"
      data-testid="explore-destinations-panel"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-200">
          Next hops from {anchorIata}
          {destinationsLoading ? " (loading…)" : ` (${total}${truncated ? "+" : ""})`}
        </p>
        <div className="flex flex-wrap gap-1">
          {CONTINENT_FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              className={`rounded px-1.5 py-0.5 text-[10px] ${
                continentFilter === f.id
                  ? "bg-blue-600 text-white"
                  : "border border-surface-border text-surface-muted"
              }`}
              onClick={() => onContinentFilterChange(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {destinations.length === 0 && !destinationsLoading && (
        <p className="text-caption text-surface-muted">No published routes from this airport.</p>
      )}

      <ul className="space-y-1">
        {destinations.map((d) => (
          <li
            key={d.iata}
            className={`flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1 text-xs ${
              hoverDest === d.iata ? "bg-blue-950/40" : ""
            }`}
            onMouseEnter={() => setHoverDest(d.iata)}
            onMouseLeave={() => setHoverDest(null)}
            onClick={() => handleRowClick(d.iata)}
            data-testid={`explore-dest-${d.iata}`}
          >
            <span className="min-w-0 flex-1">
              <span className="font-mono font-semibold">{d.iata}</span>
              <span className="ml-2 text-surface-muted">
                Direct ({d.carrierCount}) · {d.carriers.slice(0, 3).map(carrierName).join(", ")}
              </span>
              {d.impact && (
                <span
                  className="mt-0.5 block text-[10px] text-surface-muted"
                  data-testid={`explore-impact-${d.iata}`}
                >
                  {d.impact.routing.messages[0] ?? d.impact.network.message}
                </span>
              )}
            </span>
            {chainMode && (
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 py-0.5 text-[10px]"
                data-testid={`explore-add-${d.iata}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(d.iata);
                }}
              >
                Add
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
