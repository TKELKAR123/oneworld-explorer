# FlyerTalk launch checklist

Post only after `npm run test:ci` is green (unit + smoke + functional E2E + visual snapshots).

## Public promise

> **Zero-API RTW compliance explorer** — validates Explorer **structural and booking rules** against Rule 3015 (Feb 2026). Hybrid route index (historical + observed fixture + inactive overrides); paste times/carriers from Google Flights for stopover, stay, and carrier checks. **Not** a flight search engine; **not** pricing or availability.

## v0.4 highlights for the thread

1. **Route hero** — outcome, segment ledger (14/16), monospace chain, **Copy for FlyerTalk** + Copy route
2. **Start here vs ticket-ready** — empty load shows pick-origin CTA; partial routes show guidance, not false ocean blockers
3. **Return guide** — OSL → pick TOS sets `[OSL, TOS]` with Return label (not overwrite origin)
4. **Network honesty** — NRT↔JFK shows inactive / no recent nonstop, not “Direct oneworld flights”
5. **Globe build mode** — click airports to add stops; next-hops panel + fan arcs; PR preview under globe Network options

## Demo routes

1. Classic RTW — SC-001 (JFK→LHR→DXB→SIN→SYD→LAX→JFK) — copy FlyerTalk export
2. Implicit open jaw — SC-023 (last stop ORD)
3. Invalid O-D — SC-017
4. Carrier fail — SC-026 (UA on leg 1 via **Flight details**)
5. Full disputed OSL RTW — `sc-026-osl-full-disputed` fixture (4e-3 + Asia 5/4 when ticket-ready)
6. Africa/EU via DXB — SC-010

## Thread

Primary: [Oneworld Explorer User Guide (2008084)](https://www.flyertalk.com/forum/oneworld/2008084-oneworld-explorer-user-guide.html)

## Pre-post verification

- [ ] Route hero shows **Start here** on empty load (not “Building”)
- [ ] **Copy for FlyerTalk** clipboard contains fare + chain + segment ledger line
- [ ] Return guide: OSL only → TOS chip → `OSL-TOS` (visual: `return-guide-osl.png`)
- [ ] Globe chain mode appends stops; zoom controls work
- [ ] NRT–JFK leg shows inactive / no recent nonstop messaging
- [ ] 15+ `flyertalk-golden` catalog scenarios pass in CI
- [ ] Visual baselines committed under `tests/e2e/visual/**/*-snapshots/`

## Draft post intro

We built an open-source Rule 3015 route checker for FlyerTalk-style RTW planning: geometry (continents, oceans, open jaws, segment budgets) always on, plus honest oneworld network hints (observed vs historical vs inactive). **Copy for FlyerTalk** gives forum shorthand in one click. Search flights on **Google Flights** from each leg card, expand **Flight details** for carrier and times, and use **Agent details** for ticket fields. Mark stops as staying, connection, or not sure yet. It does **not** quote prices, call live schedule APIs, or check seat availability. Feedback welcome — especially edge cases from the User Guide.
