import type { Airport } from "../../ontology/types.js";
import {
  CA_TRANSCON_COLUMN_A,
  CA_TRANSCON_COLUMN_B,
  US_TRANSCON_COLUMN_A,
  US_TRANSCON_COLUMN_B,
} from "../constants.js";

export type TransconColumn = "A" | "B";

export function transconColumn(point: Airport): TransconColumn | null {
  if (point.country === "US" && point.usState) {
    if (US_TRANSCON_COLUMN_A.has(point.usState)) return "A";
    if (US_TRANSCON_COLUMN_B.has(point.usState)) return "B";
    return null;
  }
  if (point.country === "CA" && point.caProvince) {
    if (CA_TRANSCON_COLUMN_A.has(point.caProvince)) return "A";
    if (CA_TRANSCON_COLUMN_B.has(point.caProvince)) return "B";
    return null;
  }
  return null;
}

export function isNaTransconPair(from: Airport, to: Airport): boolean {
  const na = new Set([from.country, to.country]);
  if (!na.has("US") && !na.has("CA")) return false;
  const colFrom = transconColumn(from);
  const colTo = transconColumn(to);
  if (!colFrom || !colTo) return false;
  return colFrom !== colTo;
}
