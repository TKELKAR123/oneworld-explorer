# R3015 PDF Semantic Audit

Source: [oneworld Explorer Rule 3015 PDF (27 Feb 2026)](https://assets.ctfassets.net/m9ph4qvas97u/58dSxVDQ0kjLFD2Dsxpo6m/0ae0e100a274267777529778cbe91473/oneworld_Explorer_27_FEB_26.pdf)

**Semantic status:** `verified` | `implementation-bug` | `ambiguous` | `deferred-v02`

CI ([`scripts/audit-pdf-coverage.ts`](../../scripts/audit-pdf-coverage.ts)) fails if any `enforceInV01` rule is missing from this table or marked `implementation-bug`.

## §4(c) vs §4(g) (v0.1.4 fix)

| Concept | PDF | Implementation |
|---------|-----|----------------|
| **§4(c) O-D open jaw** | Origin airport ≠ return airport; gap is at passenger expense | [`open-jaw.ts`](../../packages/core/src/rules/helpers/open-jaw.ts) — **no** explicit `surface` leg required |
| **§4(g) intermediate surface** | Optional mid-itinerary overland sectors | User `surface` flag on a leg; evaluated by [`R3015-4g-surface.ts`](../../packages/core/src/rules/evaluators/R3015-4g-surface.ts) |

See [`docs/architecture/open-jaw-vs-surface.md`](../architecture/open-jaw-vs-surface.md).

## Semantic status — enforceInV01 (55 rules)

| Rule ID | PDF | Semantic | Notes |
|---------|-----|----------|-------|
| R3015-0-purchase | §0 | verified | whenTriggered — ticket context |
| R3015-0-fare-class | §0 | verified | |
| R3015-0-continent-count | §0 | verified | |
| R3015-0-three-continent-origin | §0 | verified | |
| R3015-itinerary-continuity | §0 | verified | |
| R3015-0-fare-basis | §0 | verified | |
| R3015-0-IONE3-markets | §0 | verified | IONE3-MARKETS.json |
| R3015-0-swp-eu-via-asia | §0 | verified | |
| R3015-0-tc-def | §0 | verified | geography ontology |
| R3015-0-continent-def | §0 | verified | geography ontology |
| R3015-0-eu-me-zones | §0 | verified | geography ontology |
| R3015-0-asia-countries | §0 | verified | geography ontology |
| R3015-0-na-includes | §0 | verified | geography ontology |
| R3015-4-carriers | §4 intro | verified | errors when carrier tagged |
| R3015-4-carriers-warn | §4 intro | verified | superseded — enforceInV01 false |
| R3015-4a | §4(a) | verified | |
| R3015-4b-direction | §4(b) | verified | TC zone sequence |
| R3015-4b-hawaii | §4(b) | verified | whenTriggered |
| R3015-4c-origin | §4(c) | verified | Implicit O-D open jaw (v0.1.4) |
| R3015-4c-open-jaw-a | §4(c)(a) | verified | Same country endpoints |
| R3015-4c-open-jaw-b | §4(c)(b) | verified | Middle East sub-zone |
| R3015-4c-open-jaw-c | §4(c)(c) | verified | US/Canada pair |
| R3015-4c-open-jaw-d | §4(c)(d) | verified | HKG/China |
| R3015-4c-open-jaw-e | §4(c)(e) | verified | MY/SG |
| R3015-4c-open-jaw-f | §4(c)(f) | verified | Africa (different countries; same country → a) |
| R3015-4c-open-jaw-g | §4(c)(g) | verified | MV/LK/IN |
| R3015-4d-no-via-origin | §4(d) | verified | |
| R3015-4e-intercon | §4(e) | verified | |
| R3015-4e-1-na | §4(e)(1) | verified | |
| R3015-4e-2-asia | §4(e)(2) | verified | Flat “2 in Asia” per Feb 2026 PDF |
| R3015-4e-3-africa-eu | §4(e)(3) | verified | MU/ZA ban when EU both directions |
| R3015-4f-origin-intl | §4(f) | verified | |
| R3015-4f-usa-exception | §4(f) | ambiguous | Hard error when schedule-complete; gap engine in v1.1 |
| R3015-4f-us-ca-domestic | §4(f) | verified | |
| R3015-4g-surface | §4(g) | verified | Explicit surface legs only |
| R3015-4g-swp-transoceanic | §4(g) | verified | whenTriggered |
| R3015-4h-segment-count | §4(h) | verified | |
| R3015-4h-continent-limits | §4(h) | verified | |
| R3015-4i-duplicate-sector | §4(i) | verified | |
| R3015-4j-codeshare | §4(j) | verified | whenTriggered |
| R3015-4j-jq-qq | §4(j) | verified | whenTriggered |
| R3015-4-affiliates | §4 affiliates | verified | whenTriggered |
| R3015-4-no-ground-transport | §4 ground | verified | whenTriggered |
| R3015-4k-us-transcon | §4(k) | verified | whenTriggered |
| R3015-4k-alaska | §4(k) | verified | whenTriggered |
| R3015-4l-australia | §4(l) | verified | whenTriggered |
| R3015-5-reservations | §5(a) | verified | whenTriggered — ticket context |
| R3015-5b-booking | §5(b) | verified | whenTriggered — RBD on segment |
| R3015-6-min-stay | §6 | verified | whenTriggered — schedule times |
| R3015-7-max-stay | §7 | verified | whenTriggered — schedule times |
| R3015-8-stopovers | §8 | verified | whenTriggered — schedule times |
| R3015-9-transfers | §9 | verified | whenTriggered — carriers + times |
| R3015-15-stock | §15 | verified | whenTriggered — validating carrier |
| R3015-15-stock-jq | §15 | verified | whenTriggered — QF/JQ + stock |
| R3015-15-cuba | §15 Cuba | verified | whenTriggered — CU + operating carrier |

## Scenario regression — §4(c)

SC-015..SC-025 in [`tests/scenarios/fixtures/`](../../tests/scenarios/fixtures/):

| Scenario | Intent |
|----------|--------|
| SC-015 | Closed loop — open-jaw a–g not applicable |
| SC-016 | Explicit surface + US open jaw (legacy pattern) |
| SC-017 / SC-025 | Invalid pair (JFK → LHR return) |
| SC-018 | MY/SG open jaw |
| SC-019–SC-022 | US/CA, Middle East, Africa open jaws |
| SC-023 | Implicit JFK → ORD (no surface leg) |
| SC-024 | Implicit OSL → TOS |
| SC-020 | Implicit JFK → LAX (open jaw only) |

## Applicability model (v0.1.3+)

Open-jaw sub-rules (a–g) are **not applicable** on closed loops. Carrier, ticketing, stay, and sales rules use `whenTriggered` — geometry-only itineraries pass vacuously. UI shows applicable checks by default; failures surface on Compliance tab when invalid.
