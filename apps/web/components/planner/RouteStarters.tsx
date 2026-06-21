"use client";

import { ROUTE_STARTERS } from "../../lib/route-starters";
import type { RouteStarter } from "../../lib/route-starters";

export interface RouteStartersProps {
  onSelect: (starter: RouteStarter) => void;
}

export function RouteStarters({ onSelect }: RouteStartersProps) {
  return (
    <div className="mb-4">
      <label className="text-caption block">
        Start from template
        <select
          className="mt-1 w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-slate-200"
          data-testid="route-starter-select"
          defaultValue=""
          onChange={(e) => {
            const id = e.target.value;
            if (!id) return;
            const starter = ROUTE_STARTERS.find((s) => s.id === id);
            if (starter) onSelect(starter);
            e.target.value = "";
          }}
        >
          <option value="">Choose a route starter…</option>
          {ROUTE_STARTERS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-1 text-caption">
        Load a proven pattern, then edit stops and search flights per leg.
      </p>
    </div>
  );
}
