"use client";

import { useEffect, useId, useRef, useState } from "react";

interface AirportOption {
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface AirportInputProps {
  label: string;
  value: string;
  onChange: (iata: string) => void;
}

export function AirportInput({ label, value, onChange }: AirportInputProps) {
  const listId = useId();
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<AirportOption[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

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
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="airport-field">
      <label htmlFor={listId}>{label}</label>
      <input
        id={listId}
        list={`${listId}-list`}
        value={query}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => {
          const next = e.target.value.toUpperCase();
          setQuery(next);
          if (next.length === 3) onChange(next);
        }}
      />
      {open && options.length > 0 && (
        <ul className="airport-suggestions" role="listbox">
          {options.map((opt) => (
            <li key={opt.iata}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(opt.iata);
                  setQuery(opt.iata);
                  setOpen(false);
                }}
              >
                <strong>{opt.iata}</strong> — {opt.city} ({opt.name})
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
