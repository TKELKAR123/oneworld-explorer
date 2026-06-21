# Testing

Full test pyramid for oneworld Explorer v1.1.x. **Ship gates** must pass before merging.

## Commands

```bash
npm run validate      # spec + country map + PDF audit integrity
npm test              # unit + integration (Vitest, no HTTP smoke)
npm run build         # required before smoke/E2E
npm run test:smoke    # API handlers + catalog smoke-api (tier S)
npm run test:e2e      # Playwright browser E2E (tier E)
npm run test:ci       # full local CI mirror (all of the above)
```

## CI pipeline (`.github/workflows/ci.yml`)

```
validate ──┐
           ├──► build ──┬──► smoke (HTTP ship gate)
unit ──────┘           └──► e2e  (browser ship gate)
                              └──► ci-pass (aggregate)
```

| Job | Blocks merge if fail? | Proves |
|-----|----------------------|--------|
| **validate** | Yes | Country map + rule traceability + PDF audit |
| **unit** | Yes | 54 rule evaluators, scenario catalog (tier I), geography, registry |
| **build** | Yes | TypeScript + Next.js production build |
| **smoke** | Yes | Route handlers + tier **S** catalog (`smoke-api` tag) |
| **e2e** | Yes | Tier **E** browser flows + catalog `smoke-ui` API checks |
| **ci-pass** | Yes | All gates green |

On E2E failure, CI uploads `playwright-report/` artifact (screenshots + traces).

## Scenario tiers (v1.1.x)

| Tier | Runner | Source | CI |
|------|--------|--------|-----|
| **S** Smoke | `tests/smoke/catalog-smoke.test.ts` | `catalog.json` entries tagged `smoke-api` (~30) | Every PR |
| **I** Integration | `tests/scenarios/rtw-scenarios.test.ts` | Full `catalog.json` (90 scenarios) | Every PR |
| **E** E2E | `tests/e2e/catalog-ui.spec.ts` + existing specs | `smoke-ui` tag subset (~15) | Every PR |
| **X** Extended | Nightly / manual | Full catalog browser + fuzz | Optional |

Machine-readable catalog: `tests/scenarios/catalog.json`  
Human matrix: `docs/scenarios/SCENARIO-CATALOG.md`

Legacy geometry fixtures in `tests/scenarios/fixtures/` remain for reference; integration tests load the catalog.

## Coverage by layer

| Layer | Location | Count (approx.) |
|-------|----------|-------------------|
| Rule unit | `tests/rules/R3015-*.test.ts` | 151 tests across 54 rules |
| Core | `packages/core/tests/` | parse, geography, registry, helpers |
| Scenario integration | `tests/scenarios/rtw-scenarios.test.ts` | 90 catalog scenarios |
| Catalog smoke (S) | `tests/smoke/catalog-smoke.test.ts` | ~30 `smoke-api` scenarios |
| Schedules / network | `packages/schedules/tests/` | OpenFlights graph, carrier filter |
| API smoke | `tests/smoke/critical-path.test.ts` | classic RTW + unknown airport |
| Network smoke | `tests/smoke/routes-network.test.ts` | `GET /api/routes/network` |
| Schedule stub smoke | `tests/smoke/schedules-search.test.ts` | disabled live search by default |
| UI E2E | `tests/e2e/` | external search links, network chips, catalog |

## Carrier / ticket / schedule (v1.1.x)

The core engine evaluates optional segment and ticket fields when present (`whenTriggered` applicability). v1.1.x adds:

- API: `segments[]` with carriers/RBD/times + `ticket` object (see `docs/API.md`)
- UI: **Booking details** accordion on the route builder
- Catalog: scenarios with `dataRichness` carrier / schedule / ticket (e.g. SC-026 UA invalid, SC-086 golden path)

Geometry-only routes still pass without nagging; carrier/stay/ticketing rules show as **active** in Compliance when data is supplied.

## Ship gate tests

| File | Layer |
|------|-------|
| `tests/smoke/critical-path.test.ts` | Classic RTW valid, invalid trace, SC-004, unknown airport |
| `tests/smoke/routes-network.test.ts` | OpenFlights network overlay API |
| `tests/smoke/schedules-search.test.ts` | Live schedule search disabled stub |
| `tests/smoke/catalog-smoke.test.ts` | Tier S — full `smoke-api` catalog subset |
| `tests/e2e/external-search.spec.ts` | Google Flights links, network chip, RTW CTA |
| `tests/e2e/critical-path.spec.ts` | Browser: default RTW, invalid trace, API health |
| `tests/e2e/catalog-ui.spec.ts` | Tier E — `smoke-ui` catalog API + UI flows |
| `tests/e2e/ui-smoke.spec.ts` | Builder UX, autocomplete (stable `data-testid`) |

## Not covered (zero-API product)

- Live schedule provider calls in default UX (dormant behind `SCHEDULE_LIVE=1`)
- Auto-populate carriers from GDS
- Pricing, availability, penalties beyond stock/Cuba checks
- Full OurAirports dataset
- Visual regression / WCAG automation
