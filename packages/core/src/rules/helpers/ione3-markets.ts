import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { FareProduct, TicketContext } from "../../ontology/types.js";

let cachedMarkets: Set<string> | null = null;

export function loadIone3Markets(): Set<string> {
  if (cachedMarkets) return cachedMarkets;
  const candidates = [
    join(dirname(fileURLToPath(import.meta.url)), "../../../../.."),
    process.cwd(),
  ];
  let path = "";
  for (const root of candidates) {
    const p = join(root, "data/IONE3-MARKETS.json");
    if (existsSync(p)) {
      path = p;
      break;
    }
  }
  const doc = JSON.parse(readFileSync(path, "utf8")) as { markets: string[] };
  cachedMarkets = new Set(doc.markets.map((m) => m.toUpperCase()));
  return cachedMarkets;
}

export function isIone3Market(market: string): boolean {
  return loadIone3Markets().has(market.toUpperCase());
}

export function resolveFareProduct(ticket?: TicketContext): FareProduct {
  if (ticket?.fareProduct) return ticket.fareProduct;
  if (ticket?.saleMarket && isIone3Market(ticket.saleMarket)) return "IONE3";
  return "DONE3";
}
