# Testing

Full test pyramid for oneworld Explorer v0.1.

## Commands

```bash
npm run validate      # country map + rule traceability (CI gate)
npm test              # unit + integration (Vitest) — 112+ tests
npm run test:smoke    # API handlers + production HTTP server
npm run build         # required before E2E
npm run test:e2e      # Playwright browser tests
```

## Coverage by layer

| Layer | Location | Proves |
|-------|----------|--------|
| **Rule unit** | `tests/rules/R3015-*.test.ts` | Each `enforceInV01` predicate (pass + fail) |
| **Core integration** | `packages/core/tests/` | parseRoute, classic RTW, geography, registry, helpers |
| **Scenarios** | `tests/scenarios/fixtures/` | Multi-rule RTW patterns (6 fixtures, auto-discovered) |
| **Schedules stub** | `packages/schedules/tests/` | v0.2 stub + carrier filter |
| **API smoke** | `tests/smoke/` | Next.js route handlers + `next start` HTTP |
| **UI E2E** | `tests/e2e/` | Browser: validate button, autocomplete, segments, traces |

## Not covered (v0.2+)

- Live schedule API adapters (Aviationstack, AeroDataBox)
- Carrier/codeshare enforcement from flight data
- Stopover/min-stay with timestamps
- Full OurAirports dataset
- Visual regression / WCAG audit automation
- Every warn-only rule (`enforceInV01: false`) with schedule fixtures

## CI

`.github/workflows/ci.yml` runs: validate → typecheck → unit tests → build → smoke → Playwright.
