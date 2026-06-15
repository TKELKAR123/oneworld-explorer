# Testing

Full test pyramid for oneworld Explorer v0.1. **Ship gates** must pass before merging.

## Commands

```bash
npm run validate      # spec + country map integrity
npm test              # 100 unit/integration tests (no HTTP smoke)
npm run build         # required before smoke/E2E
npm run test:smoke    # API handlers + production HTTP + critical path
npm run test:e2e      # Playwright browser E2E
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
| **validate** | Yes | Country map + rule traceability |
| **unit** | Yes | 31 rule predicates, scenarios, geography, registry |
| **build** | Yes | TypeScript + Next.js production build |
| **smoke** | Yes | Route handlers, `next start` HTTP, critical API paths |
| **e2e** | Yes | Real browser: load app, validate, traces, autocomplete |
| **ci-pass** | Yes | All gates green |

On E2E failure, CI uploads `playwright-report/` artifact (screenshots + traces).

## Ship gate tests

These are the minimum proof the app is **usable**:

| File | Layer |
|------|-------|
| `tests/smoke/critical-path.test.ts` | Classic RTW valid, invalid rule trace, SC-004 rejection, unknown airport, autocomplete API |
| `tests/e2e/critical-path.spec.ts` | Browser: default RTW valid, invalid trace with pdfRef, autocomplete flow, API health |

## Coverage by layer

| Layer | Location | Count |
|-------|----------|-------|
| Rule unit | `tests/rules/R3015-*.test.ts` | 31 rules × pass/fail |
| Core | `packages/core/tests/` | parse, geography, registry, helpers |
| Scenarios | `tests/scenarios/fixtures/` | 7 auto-discovered fixtures |
| Schedules stub | `packages/schedules/tests/` | v0.2 stub + carrier filter |
| API smoke | `tests/smoke/` | handlers + HTTP server + critical path |
| UI E2E | `tests/e2e/` | full UI + critical path |

## Not covered (v0.2+)

- Live schedule APIs
- Carrier/codeshare from flight data
- Stopover/min-stay with timestamps
- Full OurAirports dataset
- Visual regression / WCAG automation
