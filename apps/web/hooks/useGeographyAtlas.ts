"use client";

import { useEffect, useState } from "react";
import type { GeographyAtlas } from "@oneworld-explorer/core";

let cache: GeographyAtlas | null = null;
let inflight: Promise<GeographyAtlas> | null = null;

async function fetchAtlas(): Promise<GeographyAtlas> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch("/api/geography/atlas")
    .then((r) => {
      if (!r.ok) throw new Error("Atlas unavailable");
      return r.json() as Promise<GeographyAtlas>;
    })
    .then((data) => {
      cache = data;
      inflight = null;
      return data;
    })
    .catch((e) => {
      inflight = null;
      throw e;
    });
  return inflight;
}

export function useGeographyAtlas(): {
  atlas: GeographyAtlas | null;
  loading: boolean;
  error: boolean;
} {
  const [atlas, setAtlas] = useState<GeographyAtlas | null>(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cache) {
      setAtlas(cache);
      setLoading(false);
      return;
    }
    let cancelled = false;
    void fetchAtlas()
      .then((data) => {
        if (!cancelled) {
          setAtlas(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { atlas, loading, error };
}
