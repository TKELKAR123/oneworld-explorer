# UX evaluation — v0.6 post-fix (2026-06-21)

Structured pass after merging PR #1 and applying post-v0.6 fixes (globe zoom/reset, hero continent pills, SC-001 DOH, Russia Urals split).

## Before → after summary

| Area | Before | After |
|------|--------|-------|
| Globe zoom | Wheel + OrbitControls fought; snap-back near max zoom | OrbitControls zoom off; wheel/toolbar own zoom; distances aligned |
| Reset view | `flyTarget` stuck; zoom changes re-flew to anchor | `flyTarget` clears ~850ms; fly effect ignores zoom-only changes |
| Hero | Segment ledger only; continent count hidden | `RouteShapePills`: N continents, Atlantic/Pacific ✓, return status |
| SC-001 template | DXB→SIN (unpublished hop) | DOH→SIN (published in Jonty index) |
| Map Russia | Single Europe/TC2 polygon | West/east split at 60°E in geography atlas |
| Stale chrome | PH “Network options” banner in planner | Removed |

## Checklist

| Scenario | Pass criteria | Result |
|----------|---------------|--------|
| **Empty** | Start here; no orphan PR banner; search works; globe draggable | **Pass** — empty state + explore search; PH banner removed |
| **Build LHR→DOH** | Next hops from LHR; add DOH; chain updates | **Pass** — destinations API + explore fan; DOH in LHR fan |
| **Template SC-001 (DOH)** | Loads valid; hero shows continent count + segment ledger; leg 3 feasibility green | **Pass** — LONE4, 4 continents pill, DOH→SIN published |
| **Zoom** | ± and wheel smooth, no snap-back | **Pass** — unit + E2E monotonic wheel steps |
| **Reset** | Returns 100%; drag works after reset | **Pass** — E2E reset + post-reset drag POV change |
| **Map TC zones** | Russia split visible at Urals | **Pass** — atlas has west (TC2) + east (TC3) entries |
| **Health drawer** | Top issues; checklist on expand | **Pass** — existing E2E coverage unchanged |
| **Mobile tab** | Build / Explore / Checks at 390px | **Pass** — adaptive grid from v0.6; not re-baselined this pass |

## Tests run

- `npm test` — 332 unit tests green
- E2E: `globe-wheel-zoom`, `globe-reset-view`, `critical-path` — green after fixes
- Visual baselines: not refreshed this pass (hero layout changed; run `npm run test:e2e:visual` before next visual release)

## Open issues (defer)

1. **Philippine Airlines preview toggle** — removed in v0.6; needs product placement (Health drawer or map options).
2. **Weekly route refresh workflow** — `.github/workflows/refresh-routes-weekly.yml` not merged; manual `npm run build:routes` until then.
3. **Visual regression** — refresh hero/globe snapshots after RouteShapePills lands in CI.
4. **Fan overlay vs drag** — dense destination chips can intercept pointer on small viewports; consider lowering hit area when not hovering list.

## Screenshot pairs

Before/after screenshots were captured during manual QA in the planning session (zoom jump, single-color Russia, hero without continent pill, SC-001 DXB leg red). Re-capture in CI visual suite when baselines are updated.
