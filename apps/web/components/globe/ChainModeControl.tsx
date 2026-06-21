"use client";

export interface ChainModeControlProps {
  chainMode: boolean;
  onChange: (v: boolean) => void;
}

export function ChainModeControl({ chainMode, onChange }: ChainModeControlProps) {
  return (
    <div className="flex flex-col gap-1" data-testid="globe-chain-mode-control">
      <div className="inline-flex rounded-lg border border-surface-border p-0.5 text-[11px] font-medium">
        <button
          type="button"
          data-testid="globe-chain-mode-add"
          className={`rounded-md px-3 py-1.5 transition-colors ${
            chainMode
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-surface-muted hover:text-slate-200"
          }`}
          onClick={() => onChange(true)}
        >
          Add to route
        </button>
        <button
          type="button"
          data-testid="globe-chain-mode-explore"
          className={`rounded-md px-3 py-1.5 transition-colors ${
            !chainMode
              ? "bg-slate-600 text-white shadow-sm"
              : "text-surface-muted hover:text-slate-200"
          }`}
          onClick={() => onChange(false)}
        >
          Explore only
        </button>
      </div>
      {!chainMode && (
        <p
          className="text-[10px] text-amber-200/90"
          data-testid="globe-chain-mode-banner"
        >
          Clicks change explore anchor — won&apos;t add stops to your route
        </p>
      )}
    </div>
  );
}
