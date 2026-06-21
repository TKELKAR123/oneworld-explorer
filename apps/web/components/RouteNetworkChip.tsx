"use client";

import { useEffect, useState } from "react";

interface NetworkResponse {
  directCarriers: string[];
  hasDirect: boolean;
  suggestedHubs: Array<{
    hub: string;
    firstLegCarriers: string[];
    secondLegCarriers: string[];
  }>;
  disclaimer: string;
}

export interface RouteNetworkChipProps {
  from: string;
  to: string;
  legIndex: number;
}

export function RouteNetworkChip({ from, to, legIndex }: RouteNetworkChipProps) {
  const [data, setData] = useState<NetworkResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!from || !to || from.length !== 3 || to.length !== 3) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetch(
      `/api/routes/network?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    )
      .then((r) => r.json())
      .then((body: NetworkResponse) => {
        if (!cancelled) setData(body);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  if (loading && !data) {
    return (
      <p className="text-caption text-surface-muted" data-testid={`route-network-${legIndex}`}>
        Checking route network…
      </p>
    );
  }

  if (!data) return null;

  if (data.hasDirect) {
    return (
      <p
        className="text-xs text-green-400/90"
        data-testid={`route-network-${legIndex}`}
        title={data.disclaimer}
      >
        Network: {data.directCarriers.join(", ")} (direct)
      </p>
    );
  }

  if (data.suggestedHubs.length > 0) {
    const hint = data.suggestedHubs
      .slice(0, 2)
      .map(
        (h) =>
          `via ${h.hub} (${h.firstLegCarriers.slice(0, 2).join("/")}→${h.secondLegCarriers.slice(0, 2).join("/")})`,
      )
      .join("; ");
    return (
      <p
        className="text-xs text-amber-300/90"
        data-testid={`route-network-${legIndex}`}
        title={data.disclaimer}
      >
        No direct eligible route — {hint}
      </p>
    );
  }

  return (
    <p
      className="text-xs text-surface-muted"
      data-testid={`route-network-${legIndex}`}
      title={data.disclaimer}
    >
      No eligible oneworld route in static network — verify manually
    </p>
  );
}
