"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Continent, OriginReturnSummary, StopIntent } from "@oneworld-explorer/core";
import { AirportInput } from "../AirportInput";

export interface StopCardProps {
  id: string;
  index: number;
  stop: string;
  stopsLength: number;
  stopContinents: Record<number, Continent | null>;
  unknownStops: Set<number>;
  originReturn?: OriginReturnSummary | null;
  returnGuideHint?: string | null;
  showReturnError?: boolean;
  stopIntent?: StopIntent;
  showStopIntent?: boolean;
  onStopIntentChange?: (intent: StopIntent) => void;
  onUpdate: (index: number, iata: string) => void;
  onRemove: (index: number) => void;
}

export function StopCard({
  id,
  index,
  stop,
  stopsLength,
  stopContinents,
  unknownStops,
  originReturn,
  returnGuideHint,
  showReturnError,
  stopIntent = "unknown",
  showStopIntent,
  onStopIntentChange,
  onUpdate,
  onRemove,
}: StopCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label =
    index === 0 ? "Origin" : index === stopsLength - 1 ? "Return" : "Stop";

  const returnBadge =
    index === stopsLength - 1 && index > 0 && originReturn ? (
      originReturn.mode === "closedLoop" ? (
        <span className="rounded bg-green-900/50 px-1.5 py-0.5 text-[10px] text-green-400">
          Returns to origin
        </span>
      ) : originReturn.mode === "openJaw" ? (
        <span
          className="rounded bg-green-900/50 px-1.5 py-0.5 text-[10px] text-green-400"
          title={originReturn.openJawLabel}
        >
          {originReturn.openJawLabel ?? "Permitted open jaw"}
        </span>
      ) : showReturnError ? (
        <span className="rounded bg-amber-900/50 px-1.5 py-0.5 text-[10px] text-amber-400">
          Return not permitted
        </span>
      ) : returnGuideHint ? (
        <span className="rounded bg-blue-900/40 px-1.5 py-0.5 text-[10px] text-blue-300">
          {returnGuideHint}
        </span>
      ) : null
    ) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-60" : ""}
      data-testid={`stop-card-${index}`}
    >
      <div className="relative flex items-start gap-2">
        <div className="flex flex-col items-center pt-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-500/60 bg-surface-card text-xs font-semibold text-blue-400">
            {index + 1}
          </span>
        </div>

        <div
          className="mt-1 cursor-grab touch-none rounded p-1 text-surface-muted hover:text-slate-300 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder stop ${index + 1}`}
        >
          ⠿
        </div>

        <div
          className="flex-1 rounded-lg border border-surface-border bg-surface-card/50 p-3"
          data-testid="stop-row"
        >
          <div className="mb-1 flex items-center justify-end gap-2">{returnBadge}</div>
          <AirportInput
            label={label}
            value={stop}
            onChange={(iata) => onUpdate(index, iata)}
            continent={stopContinents[index]}
            error={unknownStops.has(index) ? "Unknown airport" : null}
          />
          {showStopIntent && onStopIntentChange && (
            <div className="mt-2" data-testid={`stop-intent-${index}`}>
              <p className="text-caption mb-1">How long here?</p>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ["stopover", "Staying here"],
                    ["connection", "Quick connection"],
                    ["unknown", "Not sure yet"],
                  ] as const
                ).map(([value, text]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onStopIntentChange(value)}
                    className={`rounded px-2 py-0.5 text-[10px] ${
                      stopIntent === value
                        ? "bg-blue-600 text-white"
                        : "border border-surface-border text-surface-muted"
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-caption text-surface-muted">
                {stopIntent === "stopover"
                  ? "Counts toward minimum 2 stopovers — confirm with flight times"
                  : stopIntent === "connection"
                    ? "Treated as a connection, not a stopover"
                    : "We'll check stopovers once you add flight times"}
              </p>
            </div>
          )}
        </div>

        {stopsLength > 2 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="mt-8 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-950/50"
            aria-label={`Remove stop ${index + 1}`}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
