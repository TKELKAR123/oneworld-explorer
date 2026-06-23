"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StopIntent } from "@oneworld-explorer/core";

function formatStopsDash(stops: string[]): string {
  return stops
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^[A-Z]{3}$/.test(s))
    .join("-");
}

export interface RouteTextBarProps {
  stops: string[];
  legTypes: ("flight" | "surface")[];
  stopIntents: StopIntent[];
  onApply: (payload: {
    stops: string[];
    legTypes: ("flight" | "surface")[];
    stopIntents: StopIntent[];
  }) => void;
}

export function RouteTextBar({ stops, legTypes, stopIntents, onApply }: RouteTextBarProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const editingRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (editingRef.current) return;
    setText(formatStopsDash(stops));
  }, [stops, legTypes, stopIntents]);

  const applyText = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/itinerary/parse-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mergeMode: "replace" }),
      });
      if (!res.ok) throw new Error(`Parse failed (${res.status})`);
      const body = (await res.json()) as {
        stops: string[];
        legTypes: ("flight" | "surface")[];
        stopIntents: StopIntent[];
        parseIssues: Array<{ message: string }>;
        formatted: string;
      };
      if (body.parseIssues?.length) {
        setError(body.parseIssues.map((i) => i.message).join("; "));
      }
      if (body.stops.length >= 1) {
        editingRef.current = false;
        onApply({
          stops: body.stops,
          legTypes: body.legTypes,
          stopIntents: body.stopIntents,
        });
        setText(body.formatted ?? formatStopsDash(body.stops));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not parse route text");
    }
  }, [text, onApply]);

  function handleBlur() {
    editingRef.current = false;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      if (text.trim()) void applyText();
    }, 300);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void applyText();
    }
  }

  return (
    <details
      className="rounded-xl border border-surface-border bg-surface-card/60"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      data-testid="route-text-panel"
    >
      <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-slate-300">
        Route text (FlyerTalk syntax)
      </summary>
      <div className="border-t border-surface-border px-3 pb-3 pt-2">
        <textarea
          data-testid="route-text-input"
          className="w-full resize-y rounded-md border border-surface-border bg-surface-card px-2 py-1.5 font-mono text-xs text-slate-200"
          rows={2}
          placeholder="JFK-LHR-DOH-SIN-SYD-LAX-JFK"
          value={text}
          onFocus={() => {
            editingRef.current = true;
          }}
          onBlur={handleBlur}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="route-text-apply"
            className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-500"
            onClick={() => void applyText()}
          >
            Apply
          </button>
          <span className="text-[10px] text-surface-muted">
            Dash chain · (x) connection · [surface] · # comments
          </span>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-400" data-testid="route-text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </details>
  );
}
