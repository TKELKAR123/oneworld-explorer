"use client";

import { useEffect, useRef, useState } from "react";
import type { DestinationsResponse } from "../lib/globe/explore-fan-style";

export function useDestinations(
  anchorIata: string | null,
  continentFilter?: string | null,
): {
  data: DestinationsResponse | null;
  loading: boolean;
  error: boolean;
} {
  const [data, setData] = useState<DestinationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (!anchorIata || anchorIata.length !== 3) {
      setData(null);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(false);

      const params = new URLSearchParams({ from: anchorIata, limit: "60" });
      if (continentFilter) params.set("continent", continentFilter);

      void fetch(`/api/routes/destinations?${params}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((body: DestinationsResponse) => {
          if (controller.signal.aborted) return;
          setData(body);
          setLoading(false);
        })
        .catch((e) => {
          if (e instanceof DOMException && e.name === "AbortError") return;
          setError(true);
          setLoading(false);
        });
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [anchorIata, continentFilter]);

  return { data, loading, error };
}
