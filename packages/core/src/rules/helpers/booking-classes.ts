import type { TravelClass } from "../../ontology/types.js";

type RbdRow = Partial<Record<TravelClass | "premium-economy", Set<string>>>;

const DEFAULT_ECONOMY = new Set(["L"]);
const DEFAULT_BUSINESS = new Set(["D", "I"]);
const DEFAULT_FIRST = new Set(["A"]);

const CARRIER_RBD: Record<string, RbdRow> = {
  AA: { first: new Set(["A"]), business: new Set(["D", "I"]), economy: new Set(["L"]), "premium-economy": new Set(["P"]) },
  BA: { first: new Set(["A"]), business: new Set(["D", "I"]), economy: new Set(["L"]), "premium-economy": new Set(["T"]) },
  CX: { first: new Set(["A"]), business: new Set(["D", "I"]), economy: new Set(["L"]), "premium-economy": new Set(["R"]) },
  MH: { first: new Set(["A"]), business: new Set(["D", "I"]), economy: new Set(["L"]) },
  QF: { first: new Set(["A"]), business: new Set(["D", "I"]), economy: new Set(["L"]), "premium-economy": new Set(["R"]) },
  QR: { first: new Set(["A"]), business: new Set(["D", "I", "A"]), economy: new Set(["L"]) },
  AS: { first: new Set(["D"]), business: new Set(["D", "I"]), economy: new Set(["L"]) },
  AT: { first: new Set(["D"]), business: new Set(["D", "I"]), economy: new Set(["L"]) },
  FJ: { first: new Set(["D"]), business: new Set(["D", "I"]), economy: new Set(["L"]) },
  IB: { first: new Set(["D"]), business: new Set(["D", "I"]), economy: new Set(["L"]), "premium-economy": new Set(["T"]) },
  RJ: { first: new Set(["D"]), business: new Set(["D", "I"]), economy: new Set(["L"]), "premium-economy": new Set(["W"]) },
  UL: { first: new Set(["D"]), business: new Set(["D", "I"]), economy: new Set(["L"]) },
  AY: { first: new Set(["D", "Y"]), business: new Set(["D", "I", "Y"]), economy: new Set(["L", "Y"]) },
  JL: { first: new Set(["A", "D"]), business: new Set(["D", "I"]), economy: new Set(["L"]), "premium-economy": new Set(["E"]) },
  NU: { first: new Set(["E"]), business: new Set(["E"]), economy: new Set(["L", "E"]), "premium-economy": new Set(["E"]) },
  WY: { first: new Set(["A"]), business: new Set(["D", "I"]), economy: new Set(["L"]) },
};

const DOWNGRADE_ALLOWED = new Set(["Y", "B", "H"]);

export function isAllowedRbd(
  carrier: string,
  travelClass: TravelClass,
  rbd: string,
  isDomestic?: boolean,
): boolean {
  const code = rbd.trim().toUpperCase();
  const row = CARRIER_RBD[carrier.toUpperCase()];
  const cls = travelClass === "premium-economy" ? "premium-economy" : travelClass;

  if (row?.[cls]?.has(code)) return true;

  if (DOWNGRADE_ALLOWED.has(code)) return true;

  if (!row) {
    if (cls === "economy" && DEFAULT_ECONOMY.has(code)) return true;
    if (cls === "business" && DEFAULT_BUSINESS.has(code)) return true;
    if (cls === "first" && DEFAULT_FIRST.has(code)) return true;
  }

  if (carrier === "AY" || carrier === "JL" || carrier === "NU") {
    if (isDomestic && code === "Y" && (cls === "first" || cls === "business")) return true;
  }

  return false;
}
