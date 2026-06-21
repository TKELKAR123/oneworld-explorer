"use client";

import type { AttachedFlight } from "@oneworld-explorer/core";
import { useCallback, useState } from "react";
import { Button } from "./ui";

/** Flight row from schedule search API */
interface ScheduleFlight {
  marketingCarrier: string;
  operatingCarrier: string;
  operatingCarrierSource: "api" | "inferred" | "unknown";
  flightNumber: string;
  departure: { point: string; time: string };
  arrival: { point: string; time: string };
  codeshareStatus?: string;
  provider: string;
}

export interface LegFlightPickerProps {
  legIndex: number;
  from: string;
  to: string;
  isSurface: boolean;
  searchDate: string;
  onSearchDateChange: (date: string) => void;
  attachedFlight?: AttachedFlight;
  status: string;
  errorMessage?: string;
  onAttach: (flight: AttachedFlight) => void;
  onClear: () => void;
}

function toAttached(flight: ScheduleFlight, legIndex: number): AttachedFlight {
  return {
    id: `${legIndex}-${flight.flightNumber}-${flight.departure.time}`,
    legIndex,
    marketingCarrier: flight.marketingCarrier,
    operatingCarrier: flight.operatingCarrier,
    operatingCarrierSource:
      flight.operatingCarrierSource === "api"
        ? "api"
        : flight.operatingCarrierSource === "inferred"
          ? "inferred"
          : "unknown",
    flightNumber: flight.flightNumber,
    departureTime: flight.departure.time,
    arrivalTime: flight.arrival.time,
    codeshareStatus: flight.codeshareStatus,
    provider: flight.provider as AttachedFlight["provider"],
  };
}

export function LegFlightPicker({
  legIndex,
  from,
  to,
  isSurface,
  searchDate,
  onSearchDateChange,
  attachedFlight,
  status,
  errorMessage,
  onAttach,
  onClear,
}: LegFlightPickerProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScheduleFlight[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const search = useCallback(async () => {
    setLoading(true);
    setWarnings([]);
    try {
      const res = await fetch("/api/schedules/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, date: searchDate }),
      });
      const data = await res.json();
      setResults(data.flights ?? []);
      setWarnings(data.warnings ?? []);
      if (data.errorMessage) setWarnings((w) => [...w, data.errorMessage]);
    } catch {
      setWarnings(["Could not load schedules — try again or enter details manually"]);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, searchDate]);

  if (isSurface) {
    return (
      <p className="text-caption text-surface-muted" data-testid={`leg-schedule-${legIndex}`}>
        Surface sector — no flight required
      </p>
    );
  }

  return (
    <div
      className="rounded-md border border-surface-border/60 p-2"
      data-testid={`leg-schedule-${legIndex}`}
    >
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-caption">
          Date
          <input
            type="date"
            className="mt-1 block rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs"
            value={searchDate}
            onChange={(e) => onSearchDateChange(e.target.value)}
          />
        </label>
        <Button type="button" size="sm" onClick={() => void search()} disabled={loading}>
          {loading ? "Searching…" : "Find flights"}
        </Button>
        {attachedFlight && (
          <Button type="button" size="sm" variant="ghost" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>

      {attachedFlight && (
        <p
          className="mt-2 text-xs text-green-400"
          data-testid={`schedule-status-${legIndex}`}
        >
          {attachedFlight.flightNumber} · {attachedFlight.marketingCarrier}→
          {attachedFlight.operatingCarrier}
        </p>
      )}

      {errorMessage && (
        <p className="mt-2 text-xs text-amber-400">{errorMessage}</p>
      )}

      {warnings.map((w) => (
        <p key={w} className="mt-1 text-xs text-amber-300/90">
          {w}
        </p>
      ))}

      {results.length > 0 && !attachedFlight && (
        <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
          {results.map((f) => (
            <li key={`${f.flightNumber}-${f.departure.time}`}>
              <button
                type="button"
                data-testid={`flight-option-${f.flightNumber}`}
                className="w-full rounded px-2 py-1 text-left text-xs hover:bg-surface-border/40"
                onClick={() => onAttach(toAttached(f, legIndex))}
              >
                {f.flightNumber} {f.marketingCarrier}/{f.operatingCarrier}{" "}
                {new Date(f.departure.time).toUTCString().slice(17, 22)} →{" "}
                {new Date(f.arrival.time).toUTCString().slice(17, 22)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {status === "noFlights" && !attachedFlight && (
        <p className="mt-2 text-xs text-surface-muted">No eligible flights on this date</p>
      )}
    </div>
  );
}
