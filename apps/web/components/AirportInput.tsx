"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Continent } from "@oneworld-explorer/core";
import { continentColor, continentLabel } from "../lib/continent-labels";

interface AirportOption {
  iata: string;
  name: string;
  city: string;
  country: string;
  countryName?: string;
  continent?: Continent;
}

interface AirportInputProps {
  label: string;
  value: string;
  onChange: (iata: string) => void;
  continent?: Continent | null;
  error?: string | null;
}

async function resolveIata(iata: string): Promise<AirportOption | null> {
  const res = await fetch(`/api/airports/resolve?iata=${encodeURIComponent(iata)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { airport: AirportOption | null };
  return data.airport;
}

export function AirportInput({
  label,
  value,
  onChange,
  continent: continentProp,
  error: errorProp,
}: AirportInputProps) {
  const listId = useId();
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<AirportOption[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [resolvedContinent, setResolvedContinent] = useState<Continent | null>(
    continentProp ?? null,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayContinent = continentProp ?? resolvedContinent;
  const displayError = errorProp ?? inlineError;

  useEffect(() => {
    setQuery(value);
    if (value.length === 3) {
      resolveIata(value).then((a) => {
        if (a?.continent) setResolvedContinent(a.continent);
      });
    }
  }, [value]);

  useEffect(() => {
    if (continentProp !== undefined) {
      setResolvedContinent(continentProp ?? null);
    }
  }, [continentProp]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 1) {
      setOptions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/airports/search?q=${encodeURIComponent(query)}`);
      const data = (await res.json()) as { airports: AirportOption[] };
      setOptions(data.airports);
      setHighlight(0);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function commitIata(iata: string, continent?: Continent) {
    const upper = iata.trim().toUpperCase();
    onChange(upper);
    setQuery(upper);
    setInlineError(null);
    if (continent) setResolvedContinent(continent);
    setOpen(false);
  }

  async function commitOnBlur() {
    const trimmed = query.trim().toUpperCase();
    if (trimmed.length === 0) {
      setInlineError("Enter an airport code");
      return;
    }
    if (trimmed.length !== 3) {
      if (options.length > 0) {
        setInlineError("Pick an airport from the list");
        setOpen(true);
        return;
      }
      setInlineError("Use a 3-letter IATA code or search by city/country");
      return;
    }
    const airport = await resolveIata(trimmed);
    if (!airport) {
      setInlineError(`Unknown airport: ${trimmed}`);
      return;
    }
    commitIata(airport.iata, airport.continent);
  }

  function selectOption(opt: AirportOption) {
    commitIata(opt.iata, opt.continent);
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={listId} className="text-xs text-surface-muted">{label}</label>
        {displayContinent && (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: continentColor(displayContinent) }}
          >
            {continentLabel(displayContinent)}
          </span>
        )}
      </div>
      <input
        id={listId}
        list={`${listId}-list`}
        value={query}
        autoComplete="off"
        className={`mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-slate-100 outline-none ring-blue-500 focus:ring-2 ${
          displayError ? "border-red-500" : "border-surface-border"
        }`}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false);
            commitOnBlur();
          }, 150);
        }}
        onChange={(e) => {
          const next = e.target.value.toUpperCase();
          setQuery(next);
          setInlineError(null);
        }}
        onKeyDown={(e) => {
          if (!open || options.length === 0) {
            if (e.key === "Enter") {
              e.preventDefault();
              commitOnBlur();
            }
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, options.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            selectOption(options[highlight]!);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {displayError && (
        <p className="mt-1 text-xs text-red-400">{displayError}</p>
      )}
      {open && options.length > 0 && (
        <ul
          className="airport-suggestions absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-surface-border bg-surface shadow-xl"
          role="listbox"
          data-testid="airport-suggestions"
        >
          {options.map((opt, i) => (
            <li key={opt.iata} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                data-testid={`airport-option-${opt.iata}`}
                className={`w-full border-b border-surface-border/40 px-3 py-2.5 text-left last:border-0 hover:bg-surface-card ${
                  i === highlight ? "bg-surface-card ring-1 ring-inset ring-blue-500/40" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => selectOption(opt)}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-slate-100">{opt.iata}</span>
                  {opt.continent && (
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: continentColor(opt.continent) }}
                    >
                      {continentLabel(opt.continent)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-surface-muted">
                  {opt.name}
                </p>
                <p className="text-[11px] text-surface-muted/80">
                  {opt.city}, {opt.countryName ?? opt.country}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
