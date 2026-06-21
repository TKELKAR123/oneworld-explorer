"use client";

import type { ReturnGuide } from "@oneworld-explorer/core";
import { Card } from "../ui";

export interface ReturnGuidePanelProps {
  guide: ReturnGuide | null;
  loading?: boolean;
  onPickReturn?: (iata: string) => void;
}

export function ReturnGuidePanel({ guide, loading, onPickReturn }: ReturnGuidePanelProps) {
  if (loading) {
    return (
      <Card className="border-blue-900/40 bg-blue-950/15" padding="sm" data-testid="return-guide-panel">
        <p className="text-caption text-surface-muted">Loading return options…</p>
      </Card>
    );
  }

  if (!guide) return null;

  return (
    <Card
      className="border-blue-900/40 bg-blue-950/15"
      padding="sm"
      data-testid="return-guide-panel"
    >
      <p className="text-xs font-medium text-blue-200">Where you can finish</p>
      <p className="mt-1 text-caption text-surface-muted">{guide.summaryHint}</p>
      <ul className="mt-3 space-y-2">
        {guide.options.map((opt) => (
          <li key={opt.type} className="rounded border border-surface-border/60 bg-surface-card/40 p-2">
            <p className="text-xs font-medium text-slate-200">{opt.label}</p>
            <p className="mt-0.5 text-[11px] text-surface-muted">{opt.description}</p>
            {opt.exampleIatas.length > 0 && onPickReturn && (
              <div className="mt-2 flex flex-wrap gap-1">
                {opt.exampleIatas.map((iata) => (
                  <button
                    key={iata}
                    type="button"
                    data-testid={`return-guide-pick-${iata}`}
                    className="rounded bg-surface-border/80 px-2 py-0.5 font-mono text-[11px] text-blue-300 hover:bg-blue-900/50"
                    onClick={() => onPickReturn(iata)}
                  >
                    {iata}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
