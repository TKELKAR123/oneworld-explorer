# Scenario Catalog

Generated scenario catalog for Oneworld Explorer R3015 validation. **90 scenarios** covering geometry, open-jaw, carrier, ticket, and schedule dimensions.

## Summary

- Total scenarios: **90**
- Fixture-backed (SC-001–SC-025): **25**
- Extended catalog (SC-026+): **65**
- `enforceInV01` rules with `rulesTouched` coverage: **54**

## By taxonomy

### IONE3-markets

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-051 | IONE3 business 3-continent from disallowed sale market XX | yes | compliance, ticket |

### R3015-0-continent-count

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-003 | Rule 3015 §0 — fewer than 3 continents | no | geometry-only, smoke-api |

### R3015-4a

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-002 | Rule 3015 §4(a) — missing Pacific crossing | no | geometry-only, smoke-api |

### R3015-4b-hawaii

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-007 | FlyerTalk — Hawaii backtrack §4(b) | no | geometry-only, smoke-api |

### R3015-4c-origin

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-017 | Invalid open jaw — JFK origin with LHR return (no permitted §4(c) pair) | no | open-jaw, geometry-only, smoke-api |
| SC-025 | Invalid open jaw — JFK origin with LHR return (no §4(c) pair) | no | geometry-only, smoke-api |

### R3015-4f-usa-exception

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-014 | US origin with two international departures emits §4f warning | no | open-jaw, geometry-only |

### R3015-4h-continent-limits

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-004 | FlyerTalk — excessive intra-Asia segments | no | geometry-only, smoke-api |

### R3015-4i-duplicate-sector

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-005 | Rule 3015 §4(i) — duplicate city pair | no | geometry-only, smoke-api |

### R3015-4k-us-transcon

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-011 | Two US/Canada transcontinental flights | no | open-jaw, geometry-only, smoke-api |

### R3015-itinerary-continuity

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-008 | Disconnected segments — DXB/SIN gap | no | geometry-only, smoke-api |

### UNKNOWN_AIRPORT

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-006 | Unknown airport — structured parse error | no | smoke-api, geometry-only |

### africa-eu

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-062 | Africa + Europe both directions — Mauritius not permitted | no | geometry-only |

### alaska

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-056 | Excessive Alaska segments — two arrivals in AK | no | geometry-only |

### australia-domestic

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-057 | Australia PER–SYD limited pair flown twice same direction | no | geometry-only |

### booking-class

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-040 | Invalid RBD X on AA economy sector | no | ticket, compliance |

### carrier

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-027 | Valid BA/AA eligible-on-eligible codeshare | yes | carriers, smoke-api |
| SC-028 | Valid QF/JQ codeshare exception | yes | carriers, smoke-api |
| SC-030 | Valid AA/MQ American Eagle affiliate | yes | carriers |
| SC-064 | Eligible carrier online transfer between BA sectors | yes | carriers |
| SC-072 | QF/QQ Alliance Airlines codeshare exception | yes | carriers |
| SC-077 | Valid BA-only marketed sectors throughout | yes | carriers, smoke-ui |

### carrier+geo

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-076 | Cuba RTW with non-AA operators only — §15 pass | yes | compliance, carriers |

### carrier-eligibility

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-026 | Ineligible carrier UA on first sector | no | carriers, smoke-api |

### classic-rtw

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-001 | FlyerTalk — classic eastbound RTW pattern | yes | smoke-api, smoke-ui, geometry-only |
| SC-009 | Classic RTW with full rule trace | yes | smoke-api, smoke-ui, geometry-only |
| SC-010 | Africa + Gulf — DXB alone should not trigger §4e-3 Europe ban | no | open-jaw, geometry-only, smoke-api |
| SC-045 | Business class 4-continent RTW — DONE4 fare basis | yes | builder, smoke-ui |
| SC-085 | Full ticket + schedule + carrier golden path | yes | smoke-api, smoke-ui, booking |
| SC-086 | Geometry-only baseline — no ticket or carrier metadata | yes | smoke-api, geometry-only |

### closed-loop

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-015 | Closed loop JFK–JFK — open-jaw exception rules not applicable | yes | smoke-api, smoke-ui, geometry-only |

### codeshare

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-029 | Invalid BA/JQ codeshare — not a permitted pair | no | carriers |

### continent-origin

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-044 | 3-continent Explorer fare originating in South America (GRU) | no | compliance, smoke-api |

### cuba-restriction

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-042 | Cuba itinerary with AA-operated sector | no | compliance, carriers, smoke-api |

### direction

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-013 | India–Maldives open jaw MAA→MLE (§4c-g) — direction fail | no | open-jaw, geometry-only |
| SC-054 | TC backtracking — LHR return before Pacific crossing | no | geometry-only |

### extended-rtw

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-068 | 5-continent RTW — LONE5 economy | yes | builder, smoke-ui |

### fare-class

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-059 | Higher booking class on one sector vs declared economy | no | compliance |

### general

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-070 | First class 4-continent — AONE4 | yes | builder |
| SC-071 | Business 5-continent — DONE5 | yes | builder |
| SC-081 | IONE3 allowed from US sale market | yes | ticket, builder |

### geography

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-065 | Panama PTY counts as North America continent | yes | geometry-only, compliance |
| SC-066 | Middle East sub-zone routing (DXB/RUH) | no | geometry-only |
| SC-067 | Central Asia ALA counts as Asia continent | yes | geometry-only |
| SC-090 | Caribbean origin counts as North America (MIA RTW) | yes | geometry-only, compliance |

### geometry-only

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-052 | Business 3-continent DONE3 from allowed US market | yes | builder |

### ground-transport

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-043 | BA/QF ground transport segment not permitted | no | compliance |

### intercon-asia

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-061 | Asia — third intercontinental departure exceeds allowance | no | geometry-only |

### intercon-na

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-074 | North America third intercontinental departure | no | geometry-only |

### max-continents

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-069 | 6-continent RTW — LONE6 economy cap | yes | builder |

### max-stay

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-037 | Max stay exceeded — return over 12 months from origin | no | schedule, smoke-api |

### min-stay

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-035 | TC1 origin min stay — last intl sector under 10 days | no | schedule, smoke-api |

### ocean-crossing

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-050 | Double Atlantic crossing — extra TATL | no | geometry-only, smoke-api |

### open-jaw

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-012 | HKG–China open jaw via surface (§4c-d) | no | open-jaw, geometry-only |
| SC-016 | US origin-country open jaw via surface (§4c-a) | yes | open-jaw, geometry-only, smoke-api, smoke-ui |
| SC-018 | Malaysia–Singapore open jaw (§4c-e) with surface | no | open-jaw, geometry-only |
| SC-019 | US/Canada open jaw via surface (§4c-c) | yes | open-jaw, geometry-only, smoke-api, smoke-ui |
| SC-020 | Incomplete RTW ending at LAX — implicit US open jaw JFK→LAX but missing return leg | yes | geometry-only, smoke-ui |
| SC-021 | Middle East open jaw via surface (§4c-b) | no | geometry-only |
| SC-022 | Africa open jaw via surface (§4c-f) | no | geometry-only |
| SC-023 | Implicit US open jaw JFK→ORD — no surface leg required (§4c-a) | yes | geometry-only, smoke-ui |
| SC-024 | Implicit Norway open jaw OSL→TOS — no surface leg required (§4c-a) | yes | geometry-only, smoke-ui |
| SC-080 | Europe origin implicit open jaw OSL–TRD | yes | open-jaw, geometry-only |
| SC-088 | Maldives–Sri Lanka surface sector within permitted §4c-g pair | no | open-jaw |
| SC-089 | HKG–PEK implicit open jaw without surface flag | no | open-jaw |

### origin-intl

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-084 | Origin international departure limit — extra US intl out | no | geometry-only |

### purchase-timing

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-034 | Ticket not purchased before departure | no | ticket, compliance |

### reservations

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-058 | Missing PNR OSI YY OW RTW | no | ticket, compliance |

### reverse-sector-ok

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-078 | Reverse-direction duplicate sector permitted (LHR–JFK then JFK–LHR) | no | geometry-only |

### schedule

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-036 | TC1 origin min stay — 10+ days between first and last intl sector | yes | schedule |
| SC-039 | Minimum 2 stopovers satisfied | yes | schedule |
| SC-075 | TC2 origin min stay not enforced (non-TC1) | yes | schedule |

### segment-count

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-055 | Too few segments (§4h minimum 3) | no | geometry-only |

### short-rtw

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-046 | First class 3-continent — AONE3 fare basis | yes | builder |

### stopovers

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-038 | Fewer than 2 stopovers (24h+ connections) | no | schedule |

### surface

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-048 | SWP origin — two transoceanic surface sectors not permitted | no | geometry-only |
| SC-053 | Transoceanic intermediate surface from non-SWP origin | no | geometry-only |

### swp-eu-direct

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-060 | SWP–Europe direct QF1 — Asia counted via §0 SWP-EU-via-Asia | yes | geometry-only, compliance |

### swp-origin

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-047 | SWP origin — one permitted transoceanic surface sector | yes | geometry-only, open-jaw, smoke-api |

### ticket

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-032 | BA validating carrier on §15 stock list | yes | ticket, smoke-api |
| SC-073 | WY stock valid with full ticketing context | yes | ticket |

### ticket+carrier

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-082 | IB stock with WY validating when QF/JQ present — also blocked | no | ticket, carriers |

### ticket+rbd

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-041 | Valid economy RBD L on AA | yes | ticket |

### ticketing-stock

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-031 | NU validating carrier — not on §15 stock list | no | ticket, smoke-api |
| SC-033 | IB stock with QF/JQ segment — §15 exception | no | ticket, carriers |

### transcon-ok

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-083 | Single transcontinental US flight within allowance | yes | geometry-only, smoke-ui |

### us-ca-domestic

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-063 | US/Canada domestic sectors not counted international for §4(f) | yes | geometry-only |

### usa-exception

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-087 | US origin §4f warning becomes error without transfer pair | no | smoke-ui, geometry-only |

### via-origin

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-049 | Mid-itinerary return via origin point (§4d) | no | geometry-only, smoke-api |

### westbound-rtw

| ID | Source | Valid | Tags |
| --- | --- | --- | --- |
| SC-079 | Westbound RTW SYD origin closed loop | yes | builder, smoke-ui |

## Open-jaw coverage (§4c)

| Type | Rule | Scenario IDs |
| --- | --- | --- |
| within-origin-country | R3015-4c-open-jaw-a | SC-015, SC-016, SC-020, SC-023, SC-024, SC-080 |
| within-middle-east | R3015-4c-open-jaw-b | SC-015, SC-021, SC-066 |
| us-canada | R3015-4c-open-jaw-c | SC-015, SC-019 |
| hkg-china | R3015-4c-open-jaw-d | SC-012, SC-015, SC-089 |
| my-sin | R3015-4c-open-jaw-e | SC-015, SC-018 |
| within-africa | R3015-4c-open-jaw-f | SC-015, SC-022 |
| mv-lk-in | R3015-4c-open-jaw-g | SC-013, SC-015, SC-088 |

## Rule coverage (`rulesTouched`)

| Rule | Scenarios |
| --- | --- |
| R3015-0-purchase | SC-034, SC-073, SC-085 |
| R3015-0-fare-class | SC-045, SC-046, SC-059, SC-070 |
| R3015-0-continent-count | SC-001, SC-003, SC-009, SC-015, SC-016, SC-019, SC-020, SC-023, SC-024, SC-044, SC-055, SC-060, SC-068, SC-069 |
| R3015-0-three-continent-origin | SC-044, SC-047, SC-090 |
| R3015-itinerary-continuity | SC-008 |
| R3015-0-fare-basis | SC-001, SC-009, SC-015, SC-016, SC-019, SC-020, SC-023, SC-024, SC-045, SC-046, SC-051, SC-052, SC-060, SC-068, SC-069, SC-070, SC-071 |
| R3015-0-IONE3-markets | SC-051, SC-052, SC-081 |
| R3015-0-swp-eu-via-asia | SC-060 |
| R3015-0-tc-def | SC-065, SC-086 |
| R3015-0-continent-def | SC-065, SC-067, SC-086 |
| R3015-0-eu-me-zones | SC-066, SC-086 |
| R3015-0-asia-countries | SC-067, SC-086 |
| R3015-0-na-includes | SC-065, SC-086, SC-090 |
| R3015-4-carriers | SC-026, SC-027, SC-064, SC-077, SC-085 |
| R3015-4a | SC-001, SC-002, SC-009, SC-012, SC-015, SC-016, SC-019, SC-020, SC-023, SC-024, SC-050, SC-078, SC-079 |
| R3015-4b-direction | SC-001, SC-009, SC-013, SC-015, SC-016, SC-019, SC-020, SC-023, SC-024, SC-050, SC-054, SC-079, SC-088 |
| R3015-4b-hawaii | SC-007 |
| R3015-4c-origin | SC-001, SC-009, SC-012, SC-013, SC-015, SC-016, SC-017, SC-019, SC-020, SC-021, SC-022, SC-023, SC-024, SC-025, SC-079, SC-080 |
| R3015-4c-open-jaw-a | SC-015, SC-016, SC-020, SC-023, SC-024, SC-080 |
| R3015-4c-open-jaw-b | SC-015, SC-021, SC-066 |
| R3015-4c-open-jaw-c | SC-015, SC-019 |
| R3015-4c-open-jaw-d | SC-012, SC-015, SC-089 |
| R3015-4c-open-jaw-e | SC-015, SC-018 |
| R3015-4c-open-jaw-f | SC-015, SC-022 |
| R3015-4c-open-jaw-g | SC-013, SC-015, SC-088 |
| R3015-4d-no-via-origin | SC-049 |
| R3015-4e-intercon | SC-050, SC-054, SC-061, SC-068, SC-074 |
| R3015-4e-1-na | SC-074 |
| R3015-4e-2-asia | SC-061 |
| R3015-4e-3-africa-eu | SC-062, SC-069 |
| R3015-4f-origin-intl | SC-063, SC-084, SC-087 |
| R3015-4f-usa-exception | SC-014, SC-087 |
| R3015-4f-us-ca-domestic | SC-063 |
| R3015-4g-surface | SC-047, SC-048, SC-053 |
| R3015-4g-swp-transoceanic | SC-047, SC-048 |
| R3015-4h-segment-count | SC-055, SC-086 |
| R3015-4h-continent-limits | SC-004, SC-086 |
| R3015-4i-duplicate-sector | SC-005, SC-078 |
| R3015-4j-codeshare | SC-026, SC-027, SC-028, SC-029, SC-030 |
| R3015-4j-jq-qq | SC-028, SC-033, SC-072 |
| R3015-4-affiliates | SC-030 |
| R3015-4-no-ground-transport | SC-043 |
| R3015-4k-us-transcon | SC-011, SC-083 |
| R3015-4k-alaska | SC-056 |
| R3015-4l-australia | SC-057 |
| R3015-5-reservations | SC-032, SC-041, SC-058, SC-073, SC-085 |
| R3015-5b-booking | SC-040, SC-041, SC-085 |
| R3015-6-min-stay | SC-035, SC-036, SC-075, SC-085 |
| R3015-7-max-stay | SC-037 |
| R3015-8-stopovers | SC-036, SC-038, SC-039, SC-085 |
| R3015-9-transfers | SC-064 |
| R3015-15-stock | SC-031, SC-032, SC-073, SC-085 |
| R3015-15-stock-jq | SC-033, SC-082 |
| R3015-15-cuba | SC-042, SC-076 |

## Smoke selections

### smoke-api (30)

- SC-001
- SC-002
- SC-003
- SC-004
- SC-005
- SC-006
- SC-007
- SC-008
- SC-009
- SC-010
- SC-011
- SC-015
- SC-016
- SC-017
- SC-019
- SC-025
- SC-026
- SC-027
- SC-028
- SC-031
- SC-032
- SC-035
- SC-037
- SC-042
- SC-044
- SC-047
- SC-049
- SC-050
- SC-085
- SC-086

### smoke-ui (15)

- SC-001
- SC-009
- SC-015
- SC-016
- SC-019
- SC-020
- SC-023
- SC-024
- SC-045
- SC-068
- SC-077
- SC-079
- SC-083
- SC-085
- SC-087
