# oneworld Explorer

Plan and validate **oneworld Explorer** round-the-world fare routes against Rule 3015 — a **zero-API** compliance explorer, not a flight search engine.

## Public promise

- **Always free, always on:** structural routing rules + OpenFlights network hints
- **You complete the picture:** search on Google Flights (links), paste times/carriers here
- **No schedule API quota** in default dev, CI, or production UX

## Monorepo layout

| Path | Purpose |
|------|---------|
| `packages/core` | Route parser, geography, Rule 3015 evaluator |
| `packages/schedules` | OpenFlights route index + offline hub graph (live APIs dormant) |
| `apps/web` | Next.js route builder + `/api/validate` + `/api/routes/network` |
| `docs/` | Formal rules, geography, API, traceability |
| `data/` | Airport ontology, eligible-routes index (`npm run build:routes`) |

## Formal specification

Requirements and implementation share one traceability chain:

| Document | Role |
|----------|------|
| [docs/rules/R3015-formal.yaml](docs/rules/R3015-formal.yaml) | Machine-readable Rule 3015 — predicates + natural language |
| [docs/rules/PREDICATES.md](docs/rules/PREDICATES.md) | Formal ontology (geography + carrier stack) |
| [docs/TRACEABILITY.md](docs/TRACEABILITY.md) | ruleId → evaluator → test matrix |
| [docs/architecture/](docs/architecture/) | C4, RPC sequences, state machine |

Official tariff: [oneworld Explorer Rule 3015 PDF (27 Feb 2026)](https://assets.ctfassets.net/m9ph4qvas97u/58dSxVDQ0kjLFD2Dsxpo6m/0ae0e100a274267777529778cbe91473/oneworld_Explorer_27_FEB_26.pdf)

## Quick start

```bash
npm install
npm run build:routes   # OpenFlights eligible route index
npm run validate       # country map + traceability + routes index
npm test               # unit/integration tests
npm run test:smoke     # API route handlers + production HTTP server
npm run build
npm run test:e2e       # Playwright — network overlay + external search links
npm run dev            # http://localhost:3000
```

### Local dev tips

- If you see **ChunkLoadError** or a blank "Application error" page after editing code, stop the dev server and run `npm run dev:clean -w @oneworld-explorer/web` (or `rm -rf apps/web/.next && npm run dev`), then hard-refresh the browser (Cmd+Shift+R).
- Do **not** run `npm run build` while `next dev` is active on the same `.next` cache — it can leave stale chunk hashes.
- Commit in small, logical units (`feat/…`, `fix/…`, `chore: rebuild routes`) and keep `main` green with `npm run test:ci` before merging.

## Testing

See [docs/TESTING.md](docs/TESTING.md) for the full pyramid.

| Layer | Command | What it proves |
|-------|---------|----------------|
| Rule unit tests | `npm test` | Each `enforceInV01` predicate in isolation |
| Scenario tests | `npm test` | Multi-rule RTW patterns |
| Route graph | `npm test` | OpenFlights BFS hub suggestions |
| API smoke | `npm run test:smoke` | `/api/routes/network`, validate, disabled schedule stub |
| UI E2E | `npm run test:e2e` | Google Flights links, network chips, RTW CTA |

CI runs five parallel jobs (validate, unit, build, smoke, e2e) — see [docs/TESTING.md](docs/TESTING.md). Local mirror: `npm run test:ci`.

## Validation API

`POST /api/validate` with:

```json
{
  "travelClass": "economy",
  "segments": [{ "from": "JFK", "to": "LHR" }],
  "stopIntents": ["unknown", "stopover", "connection"]
}
```

Returns `{ valid, rulesVersion, issues[], analysis }` — see [docs/API.md](docs/API.md).

## Rule coverage tiers

| Tier | Input | Unlocks |
|------|-------|---------|
| 1 — Stops | Route shape | §4 geometry, continents, oceans, open jaws |
| 1+ — Network | (automatic) | OpenFlights direct carriers + hub hints |
| 3 — Intent | Per-stop toggle | Provisional §8 stopover hints (self-declared) |
| 2 — Times | Booking panel | Full §6–§9, carriers, hard §4(f) when complete |
| 4 — External | Google Flights links | User searches elsewhere; paste results into Tier 2 |

Live Aviationstack/AeroDataBox: dormant behind `SCHEDULE_LIVE=1` only — not exposed in UI.

Not covered: pricing quotes, taxes, change fees, seat availability. See homepage **What this tool checks**.

## License

MIT
