"use client";

import type { RouteAnalysis } from "@oneworld-explorer/core";
import {
  FLIGHT_SEGMENT_CONTINENTS,
  FLIGHT_SEGMENT_LIMITS,
  MAX_EXPLORER_SEGMENTS,
} from "../../lib/explorer-constants";
import { continentColor, continentLabel } from "../../lib/continent-labels";

export interface SegmentLedgerCompactProps {
  analysis: RouteAnalysis | null;
  onHighlightLegs?: (indices: number[]) => void;
}

export function SegmentLedgerCompact({
  analysis,
  onHighlightLegs,
}: SegmentLedgerCompactProps) {
  if (!analysis) {
    return (
      <p className="text-caption text-surface-muted" data-testid="segment-ledger">
        Segment budget appears once you add stops.
      </p>
    );
  }

  const totalUsed = analysis.totalSegments;
  const totalLimit = MAX_EXPLORER_SEGMENTS;

  return (
    <div className="space-y-2" data-testid="segment-ledger">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-200">Segments</span>
        <span
          className={
            totalUsed > totalLimit ? "font-semibold text-red-400" : "text-surface-muted"
          }
        >
          {totalUsed}/{totalLimit}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {FLIGHT_SEGMENT_CONTINENTS.map((continent) => {
          const limit = FLIGHT_SEGMENT_LIMITS[continent];
          const used = analysis.flightSegmentsByContinent[continent] ?? 0;
          const over = used > limit;
          const legIndices = analysis.segments
            .filter((s) => !s.surface && s.fromContinent === continent)
            .map((s) => s.index);
          const unused = used === 0;

          return (
            <button
              key={continent}
              type="button"
              data-testid={`segment-budget-${continent}`}
              disabled={legIndices.length === 0}
              onClick={() => onHighlightLegs?.(legIndices)}
              className={`rounded-full border px-2 py-0.5 text-[11px] ${
                over
                  ? "border-red-800/60 bg-red-950/40 text-red-300"
                  : unused
                    ? "border-surface-border/60 bg-surface-card/50 text-surface-muted opacity-70"
                    : "border-surface-border bg-surface-card text-surface-muted"
              }`}
            >
              <span
                className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: continentColor(continent) }}
              />
              {continentLabel(continent)} {used}/{limit}
            </button>
          );
        })}
      </div>
    </div>
  );
}
