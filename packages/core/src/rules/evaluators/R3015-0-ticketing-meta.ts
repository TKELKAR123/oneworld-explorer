import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { EvaluationContext } from "../../ontology/types.js";
import { hasTicketContext } from "../helpers/ticketing.js";
import { ruleError } from "./utils.js";

let ione3Markets: Set<string> | null = null;

function loadIone3Markets(): Set<string> {
  if (ione3Markets) return ione3Markets;
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
  const raw = readFileSync(path, "utf-8");
  const data = JSON.parse(raw) as { markets: Array<string | { iso: string }> };
  ione3Markets = new Set(
    data.markets.map((m) =>
      (typeof m === "string" ? m : m.iso).toUpperCase(),
    ),
  );
  return ione3Markets;
}

export function evaluateR3015_0_purchase(ctx: EvaluationContext) {
  const ticket = ctx.ticket ?? ctx.options.ticket;
  if (!hasTicketContext(ticket)) return [];
  if (ticket!.purchasedBeforeDeparture === false) {
    return [
      ruleError(
        "R3015-0-purchase",
        "Fares apply only if purchased prior to departure (§0).",
      ),
    ];
  }
  return [];
}

export function evaluateR3015_0_IONE3_markets(ctx: EvaluationContext) {
  if (ctx.analysis.suggestedFareBasis !== "IONE3") return [];

  const ticket = ctx.ticket ?? ctx.options.ticket;
  const market = ticket?.saleMarket?.trim().toUpperCase();
  if (!market) return [];

  if (!loadIone3Markets().has(market)) {
    return [
      ruleError(
        "R3015-0-IONE3-markets",
        `IONE3 (3-continent business) is not offered from sale market ${market}.`,
      ),
    ];
  }
  return [];
}
