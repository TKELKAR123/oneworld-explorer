import type { StopIntent } from "@oneworld-explorer/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { LegBookingDetails } from "./segment-booking";
import { emptyLegDetails } from "./segment-booking";

export interface ItineraryState {
  stops: string[];
  legTypes: ("flight" | "surface")[];
  legDetails: LegBookingDetails[];
  stopIntents: StopIntent[];
  returnLocked?: boolean;
}

function pairKey(from: string, to: string): string {
  return `${from.toUpperCase()}-${to.toUpperCase()}`;
}

function buildPairMap<T>(stops: string[], values: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (let i = 0; i < stops.length - 1; i++) {
    map.set(pairKey(stops[i]!, stops[i + 1]!), values[i]!);
  }
  return map;
}

function rebuildLegsFromPairs(
  stops: string[],
  pairTypes: Map<string, "flight" | "surface">,
  pairDetails: Map<string, LegBookingDetails>,
): { legTypes: ("flight" | "surface")[]; legDetails: LegBookingDetails[] } {
  const legTypes: ("flight" | "surface")[] = [];
  const legDetails: LegBookingDetails[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const key = pairKey(stops[i]!, stops[i + 1]!);
    legTypes.push(pairTypes.get(key) ?? "flight");
    legDetails.push(pairDetails.get(key) ?? {});
  }
  return { legTypes, legDetails };
}

export function reorderStops(
  state: ItineraryState,
  from: number,
  to: number,
): ItineraryState {
  const pairTypes = buildPairMap(state.stops, state.legTypes);
  const pairDetails = buildPairMap(state.stops, state.legDetails);
  const newStops = arrayMove(state.stops, from, to);
  const newIntents = arrayMove(state.stopIntents, from, to);
  const { legTypes, legDetails } = rebuildLegsFromPairs(newStops, pairTypes, pairDetails);
  return { stops: newStops, legTypes, legDetails, stopIntents: newIntents };
}

export function insertStopAt(
  state: ItineraryState,
  insertIndex: number,
  iata: string,
): ItineraryState {
  const code = iata.toUpperCase();
  const nextStops = [...state.stops];
  nextStops.splice(insertIndex, 0, code);

  const pairTypes = buildPairMap(state.stops, state.legTypes);
  const pairDetails = buildPairMap(state.stops, state.legDetails);

  const legIdx = Math.max(0, insertIndex - 1);
  if (state.stops.length >= 2 && insertIndex > 0 && insertIndex < state.stops.length) {
    const from = state.stops[legIdx]!;
    const to = state.stops[insertIndex]!;
    const oldKey = pairKey(from, to);
    const oldType = pairTypes.get(oldKey) ?? "flight";
    const oldDetail = pairDetails.get(oldKey) ?? {};
    pairTypes.delete(oldKey);
    pairDetails.delete(oldKey);
    pairTypes.set(pairKey(from, code), oldType);
    pairDetails.set(pairKey(from, code), oldDetail);
    pairTypes.set(pairKey(code, to), "flight");
    pairDetails.set(pairKey(code, to), {});
  } else if (insertIndex === 0 && state.stops.length > 0) {
    pairTypes.set(pairKey(code, state.stops[0]!), state.legTypes[0] ?? "flight");
    pairDetails.set(pairKey(code, state.stops[0]!), state.legDetails[0] ?? {});
  } else {
    pairTypes.set(pairKey(state.stops[state.stops.length - 1]!, code), "flight");
    pairDetails.set(pairKey(state.stops[state.stops.length - 1]!, code), {});
  }

  const nextIntents = [...state.stopIntents];
  nextIntents.splice(insertIndex, 0, "unknown");
  const { legTypes, legDetails } = rebuildLegsFromPairs(nextStops, pairTypes, pairDetails);
  return { stops: nextStops, legTypes, legDetails, stopIntents: nextIntents };
}

/** Insert hub after legIndex (splits leg legIndex into two flight legs). */
export function insertHubAt(
  state: ItineraryState,
  legIndex: number,
  hub: string,
): ItineraryState {
  return insertStopAt(state, legIndex + 1, hub);
}

export function removeStopAt(state: ItineraryState, index: number): ItineraryState {
  if (state.stops.length <= 1) {
    return { stops: [], legTypes: [], legDetails: [], stopIntents: [] };
  }
  const nextStops = state.stops.filter((_, i) => i !== index);
  const pairTypes = buildPairMap(state.stops, state.legTypes);
  const pairDetails = buildPairMap(state.stops, state.legDetails);

  if (index > 0 && index < state.stops.length - 1) {
    const prev = state.stops[index - 1]!;
    const next = state.stops[index + 1]!;
    const leftType = pairTypes.get(pairKey(prev, state.stops[index]!)) ?? "flight";
    pairTypes.set(pairKey(prev, next), leftType);
    pairDetails.set(pairKey(prev, next), pairDetails.get(pairKey(prev, state.stops[index]!)) ?? {});
  }

  const nextIntents = state.stopIntents.filter((_, i) => i !== index);
  const { legTypes, legDetails } = rebuildLegsFromPairs(nextStops, pairTypes, pairDetails);
  return { stops: nextStops, legTypes, legDetails, stopIntents: nextIntents };
}

export function appendStop(state: ItineraryState): ItineraryState {
  return {
    stops: [...state.stops, ""],
    legTypes: [...state.legTypes, "flight"],
    legDetails: [...state.legDetails, {}],
    stopIntents: [...state.stopIntents, "unknown"],
  };
}

export function emptyItineraryState(length: number): ItineraryState {
  return {
    stops: [],
    legTypes: [],
    legDetails: emptyLegDetails(0),
    stopIntents: [],
  };
}

export function countFilledStops(stops: string[]): number {
  return stops.filter((s) => /^[A-Z]{3}$/i.test(s.trim())).length;
}

export function isValidIata(code: string): boolean {
  return /^[A-Z]{3}$/i.test(code.trim());
}

/** Set or append the return airport without overwriting origin. */
export function setReturnStop(state: ItineraryState, iata: string): ItineraryState {
  const code = iata.toUpperCase();
  if (state.stops.length === 0) {
    return {
      stops: [code],
      legTypes: [],
      legDetails: [],
      stopIntents: ["unknown"],
      returnLocked: true,
    };
  }

  const lastIdx = state.stops.length - 1;
  const last = state.stops[lastIdx]?.trim() ?? "";
  const onlyOrigin = state.stops.length === 1 && isValidIata(state.stops[0] ?? "");

  if (onlyOrigin) {
    return { ...insertStopAt(state, 1, code), returnLocked: true };
  }

  if (last === "" || state.returnLocked) {
    const nextStops = [...state.stops];
    nextStops[lastIdx] = code;
    return { ...state, stops: nextStops, returnLocked: true };
  }

  return { ...insertStopAt(state, state.stops.length, code), returnLocked: true };
}

/** Insert an empty stop before the locked return slot (or append if no return). */
export function insertStopBeforeReturn(state: ItineraryState): ItineraryState {
  if (state.returnLocked && state.stops.length >= 2) {
    const insertAt = state.stops.length - 1;
    return insertStopAt(state, insertAt, "");
  }
  return appendStop(state);
}
