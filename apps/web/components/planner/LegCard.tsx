"use client";

import type { TravelClass } from "@oneworld-explorer/core";
import { useState } from "react";
import {
  flightConnectionsLeg,
  flightsFromLeg,
  googleFlightsLeg,
} from "../../lib/external-search-links";
import { parseLegPaste } from "../../lib/parse-leg-paste";
import type { LegBookingDetails } from "../../lib/segment-booking";
import { ELIGIBLE_CARRIER_CODES, carrierName } from "../../lib/carrier-labels";
import type { LegNetworkState } from "../../hooks/useRouteNetwork";
import { AirportInput } from "../AirportInput";
import { FeasibilityBanner } from "./FeasibilityBanner";

export interface LegCardProps {
  legIndex: number;
  from: string;
  to: string;
  fromCity?: string;
  toCity?: string;
  isSurface: boolean;
  travelClass: TravelClass;
  network: LegNetworkState;
  networkLoading?: boolean;
  details: LegBookingDetails;
  expanded: boolean;
  focused: boolean;
  distanceKm?: number | null;
  onToggleSurface: () => void;
  onDetailsChange: (patch: Partial<LegBookingDetails>) => void;
  onToggleExpanded: (open: boolean) => void;
  onFocus: () => void;
  onInsertHub: (hub: string, legIndex: number) => void;
  onInsertStopAt?: (index: number, iata: string) => void;
  onNetworkRetry?: () => void;
  nextStopChips?: string[];
  onQuickAddStop?: (iata: string) => void;
}

function legTitle(from: string, to: string, fromCity?: string, toCity?: string): string {
  const a = fromCity ? `${fromCity} (${from})` : from;
  const b = toCity ? `${toCity} (${to})` : to;
  return `${a} → ${b}`;
}

export function LegCard({
  legIndex,
  from,
  to,
  fromCity,
  toCity,
  isSurface,
  travelClass,
  network,
  networkLoading,
  details,
  expanded,
  focused,
  distanceKm,
  onToggleSurface,
  onDetailsChange,
  onToggleExpanded,
  onFocus,
  onInsertHub,
  onInsertStopAt,
  onNetworkRetry,
  nextStopChips = [],
  onQuickAddStop,
}: LegCardProps) {
  const [searchDate, setSearchDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [pasteText, setPasteText] = useState("");
  const [insertOpen, setInsertOpen] = useState(false);
  const [insertQuery, setInsertQuery] = useState("");

  const gfUrl = googleFlightsLeg(from, to, searchDate, travelClass);
  const id = `leg-card-title-${legIndex}`;

  return (
    <div
      className={`ml-[3.25rem] rounded-lg border bg-surface-card/50 p-3 ${
        focused ? "border-blue-500/60 ring-1 ring-blue-500/30" : "border-surface-border"
      }`}
      data-testid={`leg-card-${legIndex}`}
      data-leg-focused={focused ? "true" : undefined}
      onFocus={onFocus}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted">
            Flight {legIndex + 1}
          </p>
          <h3 id={id} className="text-sm font-medium text-slate-200">
            {legTitle(from, to, fromCity, toCity)}
          </h3>
          {distanceKm != null && (
            <p className="text-caption">{distanceKm.toLocaleString()} km</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => isSurface && onToggleSurface()}
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              !isSurface ? "bg-blue-600 text-white" : "bg-surface-border text-surface-muted"
            }`}
          >
            Flight
          </button>
          <button
            type="button"
            onClick={() => !isSurface && onToggleSurface()}
            title="Overland at your expense (Rule 3015 surface sector)"
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              isSurface ? "bg-amber-600 text-white" : "bg-surface-border text-surface-muted"
            }`}
          >
            Surface
          </button>
        </div>
      </div>

      {!isSurface && (
        <>
          <div className="mt-2">
            <FeasibilityBanner
              legIndex={legIndex}
              from={from}
              to={to}
              network={network}
              loading={networkLoading}
              onInsertHub={onInsertHub}
              onRetry={onNetworkRetry}
            />
          </div>

          {nextStopChips.length > 0 && onQuickAddStop && (
            <div className="mt-2 flex flex-wrap items-center gap-1" data-testid={`leg-next-stops-${legIndex}`}>
              <span className="text-[10px] text-surface-muted">Next:</span>
              {nextStopChips.map((iata) => (
                <button
                  key={iata}
                  type="button"
                  data-testid={`leg-next-stop-${legIndex}-${iata}`}
                  className="rounded bg-surface-border/80 px-2 py-0.5 font-mono text-[10px] text-blue-300 hover:bg-blue-900/50"
                  onClick={() => onQuickAddStop(iata)}
                >
                  {iata}
                </button>
              ))}
            </div>
          )}

          {onInsertStopAt && (
            <div className="mt-2">
              {!insertOpen ? (
                <button
                  type="button"
                  className="text-[11px] text-blue-400 hover:underline"
                  data-testid={`leg-insert-stop-${legIndex}`}
                  onClick={() => setInsertOpen(true)}
                >
                  + Insert stop here
                </button>
              ) : (
                <div className="rounded border border-surface-border/60 bg-surface-card/30 p-2">
                  <AirportInput
                    label={`Stop after ${from}`}
                    value={insertQuery}
                    onChange={(iata) => {
                      onInsertStopAt(legIndex + 1, iata);
                      setInsertQuery("");
                      setInsertOpen(false);
                    }}
                  />
                  <button
                    type="button"
                    className="mt-1 text-[10px] text-surface-muted hover:text-slate-300"
                    onClick={() => setInsertOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-end gap-2">
            <label className="text-caption">
              Date
              <input
                type="date"
                className="mt-1 block rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </label>
            <a
              href={gfUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Search flights on Google Flights in new tab"
              data-testid={`leg-search-flights-${legIndex}`}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
            >
              Search flights
            </a>
            <a
              href={flightsFromLeg(from, to)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              Timetable ↗
            </a>
            <a
              href={flightConnectionsLeg(from, to)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              Route map ↗
            </a>
          </div>
          <p className="mt-1 text-caption text-surface-muted">
            Published routes only — confirm dates on Google Flights
          </p>

          <button
            type="button"
            className="mt-3 flex w-full items-center justify-between text-left text-xs font-medium text-slate-300"
            data-testid={`leg-details-toggle-${legIndex}`}
            aria-expanded={expanded}
            onClick={() => onToggleExpanded(!expanded)}
          >
            Flight details (optional)
            <span>{expanded ? "▾" : "▸"}</span>
          </button>

          {expanded && (
            <div className="mt-2 space-y-2 border-t border-surface-border/60 pt-2">
              <label className="block text-caption">
                Quick paste (e.g. BA178 10:00→18:30)
                <div className="mt-1 flex gap-2">
                  <input
                    className="flex-1 rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs"
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    data-testid="leg-paste-input"
                  />
                  <button
                    type="button"
                    className="rounded border border-surface-border px-2 py-1 text-xs"
                    onClick={() => {
                      const parsed = parseLegPaste(pasteText);
                      if (parsed) {
                        onDetailsChange(parsed);
                        setPasteText("");
                      }
                    }}
                  >
                    Apply
                  </button>
                </div>
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-caption">
                  Airline sold as
                  <input
                    list={`eligible-carriers-${legIndex}`}
                    data-testid={`leg-marketing-carrier-${legIndex}`}
                    className="mt-1 w-full rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs uppercase"
                    maxLength={2}
                    placeholder="BA"
                    value={details.marketingCarrier ?? ""}
                    onChange={(e) =>
                      onDetailsChange({
                        marketingCarrier: e.target.value.toUpperCase() || undefined,
                      })
                    }
                  />
                  <datalist id={`eligible-carriers-${legIndex}`}>
                    {ELIGIBLE_CARRIER_CODES.map((c) => (
                      <option key={c} value={c}>
                        {carrierName(c)}
                      </option>
                    ))}
                  </datalist>
                </label>
                <label className="text-caption">
                  Operated by
                  <input
                    className="mt-1 w-full rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs uppercase"
                    maxLength={2}
                    placeholder={details.marketingCarrier ?? "same"}
                    value={details.operatingCarrier ?? ""}
                    onChange={(e) =>
                      onDetailsChange({
                        operatingCarrier: e.target.value.toUpperCase() || undefined,
                      })
                    }
                  />
                </label>
                <label className="text-caption">
                  Booking class
                  <input
                    className="mt-1 w-full rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs uppercase"
                    maxLength={1}
                    value={details.rbd ?? ""}
                    onChange={(e) =>
                      onDetailsChange({ rbd: e.target.value.toUpperCase() || undefined })
                    }
                  />
                </label>
                <label className="text-caption sm:col-span-2">
                  Departure
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs"
                    value={
                      details.departureTime ? details.departureTime.slice(0, 16) : ""
                    }
                    onChange={(e) =>
                      onDetailsChange({
                        departureTime: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : undefined,
                      })
                    }
                  />
                </label>
                <label className="text-caption sm:col-span-2">
                  Arrival
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs"
                    value={details.arrivalTime ? details.arrivalTime.slice(0, 16) : ""}
                    onChange={(e) =>
                      onDetailsChange({
                        arrivalTime: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : undefined,
                      })
                    }
                  />
                </label>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
