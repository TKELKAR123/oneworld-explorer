"use client";

import type { ChecklistRow } from "../../lib/validation-checklist";

export interface ValidationChecklistProps {
  rows: ChecklistRow[];
  onRowClick?: (row: ChecklistRow) => void;
}

function statusIcon(status: ChecklistRow["status"]): string {
  switch (status) {
    case "complete":
      return "✓";
    case "partial":
      return "◐";
    case "pending":
      return "○";
    default:
      return "—";
  }
}

export function ValidationChecklist({ rows, onRowClick }: ValidationChecklistProps) {
  const firstIncomplete = rows.find(
    (r) => r.status === "pending" || r.status === "partial",
  )?.id;

  return (
    <ul className="space-y-2" data-testid="validation-checklist" role="list">
      {rows.map((row) => {
        const clickable = Boolean(onRowClick && row.focusLegIndex !== undefined);
        return (
          <li key={row.id}>
            <button
              type="button"
              disabled={!clickable}
              aria-current={row.id === firstIncomplete ? "step" : undefined}
              data-testid={`checklist-row-${row.id}`}
              className={`flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-sm ${
                row.status === "complete"
                  ? "border-green-900/40 bg-green-950/15 text-green-100"
                  : row.status === "partial"
                    ? "border-amber-900/40 bg-amber-950/15 text-amber-100"
                    : "border-surface-border bg-surface-card/40 text-slate-300"
              } ${clickable ? "hover:border-blue-500/40 cursor-pointer" : "cursor-default"}`}
              onClick={() => clickable && onRowClick?.(row)}
            >
              <span className="mt-0.5 shrink-0 font-mono text-xs">{statusIcon(row.status)}</span>
              <span>
                <span className="font-medium">{row.label}</span>
                <span className="mt-0.5 block text-caption opacity-90">{row.detail}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
