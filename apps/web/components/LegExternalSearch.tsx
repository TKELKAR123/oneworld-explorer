"use client";

import type { TravelClass } from "@oneworld-explorer/core";
import { useState } from "react";
import {
  flightConnectionsLeg,
  flightsFromLeg,
  googleFlightsLeg,
} from "../lib/external-search-links";

export interface LegExternalSearchProps {
  legIndex: number;
  from: string;
  to: string;
  isSurface: boolean;
  travelClass: TravelClass;
}

export function LegExternalSearch({
  legIndex,
  from,
  to,
  isSurface,
  travelClass,
}: LegExternalSearchProps) {
  const [searchDate, setSearchDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });

  if (isSurface) {
    return (
      <p className="text-caption text-surface-muted" data-testid={`leg-search-${legIndex}`}>
        Surface sector — no flight search
      </p>
    );
  }

  const gfUrl = googleFlightsLeg(from, to, searchDate, travelClass);

  return (
    <div
      className="rounded-md border border-surface-border/60 p-2"
      data-testid={`leg-search-${legIndex}`}
    >
      <p className="text-caption font-medium text-slate-300">
        {from} → {to}
      </p>
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
          data-testid={`google-flights-${legIndex}`}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
        >
          Search on Google Flights
        </a>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <a
          href={flightsFromLeg(from, to)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          FlightsFrom timetable
        </a>
        <a
          href={flightConnectionsLeg(from, to)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          FlightConnections map
        </a>
      </div>
      <p className="mt-1 text-caption text-surface-muted">
        Copy times and carriers into Schedule &amp; carriers below.
      </p>
    </div>
  );
}
