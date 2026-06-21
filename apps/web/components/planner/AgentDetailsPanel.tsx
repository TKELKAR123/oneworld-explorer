"use client";

import type { TicketContext } from "@oneworld-explorer/core";
import { ELIGIBLE_CARRIER_CODES, carrierName } from "../../lib/carrier-labels";

const STOCK_CARRIERS = ELIGIBLE_CARRIER_CODES;

export interface AgentDetailsPanelProps {
  ticket: TicketContext;
  onTicketChange: (ticket: TicketContext) => void;
  showFareProduct?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentDetailsPanel({
  ticket,
  onTicketChange,
  showFareProduct,
  open,
  onOpenChange,
}: AgentDetailsPanelProps) {
  return (
    <div className="mt-4 rounded-lg border border-surface-border bg-surface-card/40">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-200"
        data-testid="agent-details-toggle"
        onClick={() => onOpenChange(!open)}
      >
        Agent ticket details (optional)
        <span className="text-surface-muted">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-surface-border px-3 py-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-caption">
              Ticket issued by
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
                    {carrierName(c)} ({c})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-caption">
              Country ticket sold in
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
              <label className="text-caption sm:col-span-2">
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
              RTW remark on booking (OSI YY OW RTW)
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
