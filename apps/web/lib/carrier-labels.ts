import registry from "../../../data/CARRIER-REGISTRY.json";

const NAMES = new Map<string, string>();

for (const c of registry.eligible) {
  NAMES.set(c.iata.toUpperCase(), c.name);
}
for (const a of registry.affiliates ?? []) {
  NAMES.set(a.iata.toUpperCase(), a.name);
}

export function carrierName(iata: string): string {
  const code = iata.trim().toUpperCase();
  return NAMES.get(code) ?? code;
}

export function formatCarrierList(codes: string[], max = 3): string {
  const unique = [...new Set(codes.map((c) => c.toUpperCase()))];
  if (unique.length === 0) return "";
  const shown = unique.slice(0, max).map(carrierName);
  const rest = unique.length - shown.length;
  if (rest <= 0) return shown.join(", ");
  return `${shown.join(", ")} (+${rest} more)`;
}

export const ELIGIBLE_CARRIER_CODES = registry.eligible.map((c) => c.iata);
