"use client";

import { continentLabel } from "../../lib/continent-labels";
import { carrierName } from "../../lib/carrier-labels";
import type { DestinationClient } from "../../lib/globe/explore-fan-style";
import { Button } from "../ui";

export interface ExploreDestinationsPanelProps {
  anchorIata: string;
  destinations: DestinationClient[];
  total: number;
  truncated: boolean;
  loading: boolean;
  hoverDest: string | null;
  onHover: (iata: string | null) => void;
  onAdd: (iata: string) => void;
}

export function ExploreDestinationsPanel({
  anchorIata,
  destinations,
  total,
  truncated,
  loading,
  hoverDest,
  onHover,
  onAdd,
}: ExploreDestinationsPanelProps) {
  const grouped = destinations.reduce<Record<string, DestinationClient[]>>((acc, d) => {
    const key = d.continent ? String(d.continent) : "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  return (
    <div
      className="max-h-56 overflow-y-auto rounded-lg border border-surface-border bg-surface-card/50 p-3"
      data-testid="explore-destinations-panel"
    >
      <p className="mb-2 text-xs font-semibold text-slate-200">
        From {anchorIata} — where oneworld flies
        {loading ? " (loading…)" : ` (${total}${truncated ? "+ shown" : ""})`}
      </p>
      {destinations.length === 0 && !loading && (
        <p className="text-caption text-surface-muted">No published routes from this airport.</p>
      )}
      {Object.entries(grouped).map(([continent, dests]) => (
        <div key={continent} className="mb-3">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-surface-muted">
            {continent === "other" ? "Other" : continentLabel(continent as never)}
          </p>
          <ul className="space-y-1">
            {dests.map((d) => (
              <li
                key={d.iata}
                className={`flex items-center justify-between gap-2 rounded px-2 py-1 text-xs ${
                  hoverDest === d.iata ? "bg-blue-950/40" : ""
                }`}
                onMouseEnter={() => onHover(d.iata)}
                onMouseLeave={() => onHover(null)}
                data-testid={`explore-dest-${d.iata}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="font-mono font-semibold">{d.iata}</span>
                  <span className="ml-2 text-surface-muted">
                    {d.carriers.slice(0, 2).map(carrierName).join(", ")}
                  </span>
                  {d.impact && (
                    <span
                      className={`mt-0.5 block text-[10px] ${
                        d.impact.routing.tier === "warning" || d.impact.network.tier === "warning"
                          ? "text-amber-300"
                          : d.impact.routing.tier === "blocked"
                            ? "text-red-300"
                            : d.impact.routing.messages.length
                              ? "text-slate-400"
                              : "text-emerald-400/80"
                      }`}
                      data-testid={`explore-impact-${d.iata}`}
                    >
                      {d.impact.routing.messages[0] ??
                        d.impact.network.message}
                    </span>
                  )}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  data-testid={`explore-add-${d.iata}`}
                  onClick={() => onAdd(d.iata)}
                >
                  Add as stop
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
