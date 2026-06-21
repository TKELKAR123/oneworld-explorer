import type { Continent, RouteAnalysis } from "@oneworld-explorer/core";
import {
  FLIGHT_SEGMENT_CONTINENTS,
  FLIGHT_SEGMENT_LIMITS,
} from "../lib/explorer-constants";
import { continentColor, continentLabel } from "../lib/continent-labels";
import { Card } from "./ui";

export interface SegmentBudgetsProps {
  analysis: RouteAnalysis | null;
  onHighlightLegs?: (indices: number[]) => void;
}

function legsForContinent(analysis: RouteAnalysis, continent: Continent): number[] {
  return analysis.segments
    .filter((s) => !s.surface && s.fromContinent === continent)
    .map((s) => s.index);
}

export function SegmentBudgets({ analysis, onHighlightLegs }: SegmentBudgetsProps) {
  if (!analysis) {
    return (
      <p className="text-body">
        Segment budgets appear after validation with a complete route.
      </p>
    );
  }

  return (
    <Card>
      <p className="text-body">
        Free intra-continental flight segments (Rule 3015 §4(h)). Surface legs do not count.
      </p>
      <p className="mt-1 text-caption">Click a row to highlight matching legs on the map.</p>
      <ul className="mt-4 space-y-3">
        {FLIGHT_SEGMENT_CONTINENTS.map((continent) => {
          const limit = FLIGHT_SEGMENT_LIMITS[continent];
          const used = analysis.flightSegmentsByContinent[continent] ?? 0;
          const over = used > limit;
          const pct = Math.min(100, (used / limit) * 100);
          const legIndices = legsForContinent(analysis, continent);

          return (
            <li key={continent}>
              <button
                type="button"
                className="w-full text-left disabled:opacity-40"
                onClick={() => legIndices.length > 0 && onHighlightLegs?.(legIndices)}
                disabled={legIndices.length === 0}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: continentColor(continent) }}
                    />
                    {continentLabel(continent)}
                  </span>
                  <span className={over ? "font-medium text-red-400" : "text-surface-muted"}>
                    {used}/{limit}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-border">
                  <div
                    className={`h-full rounded-full transition-all ${
                      over ? "bg-red-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
