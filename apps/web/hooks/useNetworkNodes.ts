"use client";

import { useEffect, useState } from "react";
import type { NetworkNodeClient } from "../lib/globe/explore-fan-style";

let cached: NetworkNodeClient[] | null = null;
let inflight: Promise<NetworkNodeClient[]> | null = null;

async function fetchNodes(): Promise<NetworkNodeClient[]> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = fetch("/api/routes/graph/nodes")
    .then((r) => r.json())
    .then((body: { nodes: NetworkNodeClient[] }) => {
      cached = body.nodes ?? [];
      inflight = null;
      return cached;
    })
    .catch(() => {
      inflight = null;
      return [];
    });
  return inflight;
}

export function useNetworkNodes(): {
  nodes: NetworkNodeClient[];
  loading: boolean;
  error: boolean;
} {
  const [nodes, setNodes] = useState<NetworkNodeClient[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchNodes().then((n) => {
      if (cancelled) return;
      setNodes(n);
      setLoading(false);
      setError(n.length === 0);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { nodes, loading, error };
}
