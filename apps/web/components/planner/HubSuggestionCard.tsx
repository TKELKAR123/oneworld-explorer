"use client";

import type { HubInsertAction } from "../../lib/hub-suggestions";

export interface HubSuggestionCardProps {
  action: HubInsertAction;
  onInsert: () => void;
}

export function HubSuggestionCard({ action, onInsert }: HubSuggestionCardProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-900/40 bg-amber-950/20 px-2 py-1.5 text-xs">
      <span className="text-amber-100/90">{action.label}</span>
      <button
        type="button"
        className="shrink-0 rounded bg-amber-700/80 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-amber-600"
        data-testid={`hub-suggest-${action.legIndex}-${action.hub}`}
        onClick={onInsert}
      >
        {action.insertLabel}
      </button>
    </div>
  );
}
