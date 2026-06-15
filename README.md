# oneworld Explorer

Plan and validate **oneworld Explorer** round-the-world fare routes against Rule 3015 (geometry-only v0.1).

## Monorepo layout

| Path | Purpose |
|------|---------|
| `packages/core` | Route parser, geography, Rule 3015 evaluator |
| `packages/schedules` | Schedule search stub (v0.2) |
| `apps/web` | Next.js route builder + `/api/validate` |
| `docs/` | Formal rules, geography, API, traceability |
| `data/` | Airport and country ontology JSON |

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
npm run validate   # country map + traceability
npm test           # 112+ unit/integration tests
npm run test:smoke # API route handlers + production HTTP server
npm run build
npm run test:e2e   # Playwright — browser clicks Validate, checks UI output
npm run dev        # http://localhost:3000
```

## Testing

See [docs/TESTING.md](docs/TESTING.md) for the full pyramid.

| Layer | Command | What it proves |
|-------|---------|----------------|
| Rule unit tests | `npm test` | Each `enforceInV01` predicate in isolation (31 rules, pass + fail) |
| Scenario tests | `npm test` | Multi-rule RTW patterns (6 fixtures in `tests/scenarios/`) |
| Geography + registry | `npm test` | Russia Urals, Hawaii, Qantas map, YAML↔evaluator wiring |
| API smoke | `npm run test:smoke` | Next.js route handlers + built app over HTTP |
| UI E2E | `npm run test:e2e` | Real browser: autocomplete, segments, validate, traces |

CI runs validate → unit tests → build → smoke → Playwright E2E.

## Validation API

`POST /api/validate` with:

```json
{
  "travelClass": "economy",
  "segments": [{ "from": "JFK", "to": "LHR" }]
}
```

Returns `{ valid, rulesVersion, issues[], analysis }` — see [docs/API.md](docs/API.md).

## v0.1 scope

Enforces geometry and pricing rules marked `enforceInV01: true` in [docs/rules/R3015-formal.yaml](docs/rules/R3015-formal.yaml), including:

- §4(a)–(l) routing (oceans, TC direction, open jaws, segment limits, US transcon, Australia pairs)
- §0 continent count, fare basis, 3-continent origin, SWP↔EU via Asia

Carrier, ticketing, and schedule-dependent rules are deferred to v0.2.

## License

MIT — see [LICENSE](LICENSE).
