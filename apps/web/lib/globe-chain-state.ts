/** Pure helpers for globe chain-mode itinerary building. */

export interface ChainStop {
  iata: string;
}

export function findLastAnchorIndex(stops: string[], anchorIata: string | null): number {
  if (!anchorIata) return Math.max(0, stops.length - 1);
  let idx = -1;
  stops.forEach((s, i) => {
    if (s.toUpperCase() === anchorIata.toUpperCase()) idx = i;
  });
  return idx >= 0 ? idx : Math.max(0, stops.length - 1);
}

/** Insert `iata` immediately after the explore anchor (or last stop). */
export function appendAfterAnchor(
  stops: string[],
  legTypes: ("flight" | "surface")[],
  iata: string,
  anchorIata: string | null,
): { stops: string[]; legTypes: ("flight" | "surface")[]; insertIndex: number } {
  const code = iata.toUpperCase();
  if (stops.some((s) => s.toUpperCase() === code)) {
    const existing = stops.findIndex((s) => s.toUpperCase() === code);
    return { stops, legTypes, insertIndex: existing };
  }

  const anchorIdx = findLastAnchorIndex(stops, anchorIata);
  const insertAt = anchorIdx + 1;
  const nextStops = [...stops];
  nextStops.splice(insertAt, 0, code);
  const nextLegs = [...legTypes];
  const legInsert = Math.max(0, insertAt - 1);
  nextLegs.splice(legInsert, 0, "flight");
  return { stops: nextStops, legTypes: nextLegs, insertIndex: insertAt };
}
