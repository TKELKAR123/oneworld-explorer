"use client";

import type { AttachedFlight, LegScheduleState } from "@oneworld-explorer/core";
import { LegFlightPicker } from "./LegFlightPicker";
import { defaultSearchDate } from "../lib/leg-schedule-state";

export interface LegScheduleListProps {
  stops: string[];
  legTypes: ("flight" | "surface")[];
  legScheduleStates: LegScheduleState[];
  onLegScheduleStatesChange: (states: LegScheduleState[]) => void;
}

export function LegScheduleList({
  stops,
  legTypes,
  legScheduleStates,
  onLegScheduleStatesChange,
}: LegScheduleListProps) {
  function updateLeg(index: number, patch: Partial<LegScheduleState>) {
    const next = [...legScheduleStates];
    while (next.length < stops.length - 1) {
      next.push({
        legIndex: next.length,
        status: legTypes[next.length] === "surface" ? "surface" : "notSearched",
        searchDate: defaultSearchDate(next.length),
      });
    }
    next[index] = { ...next[index]!, ...patch };
    onLegScheduleStatesChange(next);
  }

  function attach(index: number, flight: AttachedFlight) {
    updateLeg(index, { status: "attached", attachedFlight: flight, errorMessage: undefined });
  }

  function clear(index: number) {
    updateLeg(index, {
      status: "notSearched",
      attachedFlight: undefined,
    });
  }

  return (
    <section className="space-y-2" aria-label="Flight schedule">
      <h2 className="text-sm font-medium text-slate-200">Flight schedules (optional)</h2>
      <p className="text-caption text-surface-muted">
        Search schedules to run carrier, stopover, and stay rules on specific flights.
      </p>
      {Array.from({ length: Math.max(0, stops.length - 1) }, (_, i) => (
        <div key={i}>
          <p className="mb-1 text-xs text-slate-400">
            Leg {i + 1}: {stops[i]} → {stops[i + 1]}
          </p>
          <LegFlightPicker
            legIndex={i}
            from={stops[i]!}
            to={stops[i + 1]!}
            isSurface={legTypes[i] === "surface"}
            searchDate={legScheduleStates[i]?.searchDate ?? defaultSearchDate(i)}
            onSearchDateChange={(date) => updateLeg(i, { searchDate: date })}
            attachedFlight={legScheduleStates[i]?.attachedFlight}
            status={legScheduleStates[i]?.status ?? "notSearched"}
            errorMessage={legScheduleStates[i]?.errorMessage}
            onAttach={(f) => attach(i, f)}
            onClear={() => clear(i)}
          />
        </div>
      ))}
    </section>
  );
}
