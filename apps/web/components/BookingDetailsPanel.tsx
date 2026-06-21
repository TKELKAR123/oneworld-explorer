"use client";

import { useState } from "react";
import type { LegBookingDetails } from "../lib/segment-booking";
import type { TicketContext } from "@oneworld-explorer/core";
import { parseLegPaste } from "../lib/parse-leg-paste";

const STOCK_CARRIERS = [
  "AA", "AS", "AT", "AY", "BA", "CX", "FJ", "IB", "JL", "MH", "QF", "QR", "RJ", "UL", "WY",
];

export interface BookingDetailsPanelProps {
  legCount: number;
  legDetails: LegBookingDetails[];
  onLegDetailsChange: (details: LegBookingDetails[]) => void;
  ticket: TicketContext;
  onTicketChange: (ticket: TicketContext) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  showFareProduct?: boolean;
  stops?: string[];
}

export function BookingDetailsPanel({
  legCount,
  legDetails,
  onLegDetailsChange,
  ticket,
  onTicketChange,
  expanded,
  onExpandedChange,
  showFareProduct,
  stops = [],
}: BookingDetailsPanelProps) {
  const [pasteText, setPasteText] = useState("");

  function applyPaste() {
    const parsed = parseLegPaste(pasteText);
    if (!parsed) return;
    const next = [...legDetails];
    while (next.length < legCount) next.push({});
    const target = next.findIndex((_, i) => !next[i]?.departureTime) ?? 0;
    if (target < legCount) {
      next[target] = { ...next[target], ...parsed };
      onLegDetailsChange(next);
      setPasteText("");
    }
  }
  function updateLeg(index: number, patch: Partial<LegBookingDetails>) {
    const next = [...legDetails];
    while (next.length < legCount) next.push({});
    next[index] = { ...next[index], ...patch };
    onLegDetailsChange(next);
  }

  return (
    <div className="rounded-lg border border-surface-border bg-surface-card/50">
      <button
        type="button"
        onClick={() => onExpandedChange(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-200"
        data-testid="booking-details-toggle"
      >
        <span>Schedule &amp; carriers (paste from Google Flights or booking)</span>
        <span className="text-surface-muted">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-surface-border px-3 py-3">
          <p className="text-caption">
            Paste flight times here after searching externally — unlocks §4 carrier, §6–§9, and §15
            checks.
          </p>

          <label className="block text-caption">
            Quick paste (e.g. BA178 10:00→18:30)
            <div className="mt-1 flex gap-2">
              <input
                className="flex-1 rounded-md border border-surface-border bg-surface-bg px-2 py-1.5 text-xs"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                data-testid="leg-paste-input"
              />
              <button
                type="button"
                className="rounded-md border border-surface-border px-2 py-1 text-xs hover:bg-surface-border/40"
                onClick={applyPaste}
              >
                Apply
              </button>
            </div>
          </label>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-300">Ticket</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-caption">
                Validating carrier
                <select
                  className="mt-1 w-full rounded-md border border-surface-border bg-surface-bg px-2 py-1.5 text-xs"
                  value={ticket.validatingCarrier ?? ""}
                  onChange={(e) =>
                    onTicketChange({
                      ...ticket,
                      validatingCarrier: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">—</option>
                  {STOCK_CARRIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-caption">
                Sale market (ISO)
                <input
                  className="mt-1 w-full rounded-md border border-surface-border bg-surface-bg px-2 py-1.5 text-xs uppercase"
                  placeholder="US"
                  maxLength={2}
                  value={ticket.saleMarket ?? ""}
                  onChange={(e) =>
                    onTicketChange({
                      ...ticket,
                      saleMarket: e.target.value.toUpperCase() || undefined,
                    })
                  }
                />
              </label>
              {showFareProduct && (
                <label className="text-caption">
                  3-continent business product
                  <select
                    className="mt-1 w-full rounded-md border border-surface-border bg-surface-bg px-2 py-1.5 text-xs"
                    data-testid="fare-product-select"
                    value={ticket.fareProduct ?? "DONE3"}
                    onChange={(e) =>
                      onTicketChange({
                        ...ticket,
                        fareProduct: e.target.value as "DONE3" | "IONE3",
                      })
                    }
                  >
                    <option value="DONE3">DONE3 (global business)</option>
                    <option value="IONE3">IONE3 (select markets)</option>
                  </select>
                </label>
              )}
              <label className="text-caption flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={ticket.purchasedBeforeDeparture === true}
                  onChange={(e) =>
                    onTicketChange({
                      ...ticket,
                      purchasedBeforeDeparture: e.target.checked,
                    })
                  }
                />
                Purchased before departure
              </label>
              <label className="text-caption flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={ticket.pnrHasOsiRtw === true}
                  onChange={(e) =>
                    onTicketChange({
                      ...ticket,
                      pnrHasOsiRtw: e.target.checked,
                    })
                  }
                />
                PNR includes OSI YY OW RTW
              </label>
            </div>
          </div>

          {Array.from({ length: legCount }, (_, i) => (
            <div key={i} className="rounded-md border border-surface-border/60 p-2">
              <p className="text-xs font-medium text-slate-400">
                Leg {i + 1}
                {stops[i] && stops[i + 1]
                  ? ` · ${stops[i]}→${stops[i + 1]}`
                  : ""}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <label className="text-caption">
                  Mkt
                  <input
                    data-testid={`leg-${i}-marketing-carrier`}
                    className="mt-1 w-full rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs uppercase"
                    maxLength={2}
                    value={legDetails[i]?.marketingCarrier ?? ""}
                    onChange={(e) =>
                      updateLeg(i, {
                        marketingCarrier: e.target.value.toUpperCase() || undefined,
                      })
                    }
                  />
                </label>
                <label className="text-caption">
                  Op
                  <input
                    className="mt-1 w-full rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs uppercase"
                    maxLength={2}
                    value={legDetails[i]?.operatingCarrier ?? ""}
                    onChange={(e) =>
                      updateLeg(i, {
                        operatingCarrier: e.target.value.toUpperCase() || undefined,
                      })
                    }
                  />
                </label>
                <label className="text-caption">
                  RBD
                  <input
                    className="mt-1 w-full rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs uppercase"
                    maxLength={1}
                    value={legDetails[i]?.rbd ?? ""}
                    onChange={(e) =>
                      updateLeg(i, { rbd: e.target.value.toUpperCase() || undefined })
                    }
                  />
                </label>
                <label className="text-caption sm:col-span-2">
                  Departure
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded border border-surface-border bg-surface-bg px-2 py-1 text-xs"
                    value={
                      legDetails[i]?.departureTime
                        ? legDetails[i]!.departureTime!.slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      updateLeg(i, {
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
                    value={
                      legDetails[i]?.arrivalTime
                        ? legDetails[i]!.arrivalTime!.slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      updateLeg(i, {
                        arrivalTime: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : undefined,
                      })
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
