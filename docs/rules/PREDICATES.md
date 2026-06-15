# Rule 3015 — Formal Ontology (Predicates)

Version: `2026-02-27` (matches `oneworld_Explorer_27_FEB_26.pdf`)

## Sorts (types)

| Sort | Description |
|------|-------------|
| `Point` | IATA airport code |
| `City` | Metropolitan area (for duplicate-sector rule §4(i)) |
| `Country` | ISO 3166-1 alpha-2 |
| `USState` | US state code (§4(k)) |
| `Continent` | Explorer pricing continent (6 values) |
| `SubZone` | `europe` \| `middle-east` (within EU/ME only) |
| `TC` | Traffic conference: `TC1` \| `TC2` \| `TC3` |
| `Segment` | `{ from, to, surface? }` (+ optional `flight` in v0.2) |
| `Itinerary` | Ordered list of segments |
| `Carrier` | IATA airline code |
| `BookingClass` | `economy` \| `premium-economy` \| `business` \| `first` |

## Explorer continents and TC mapping

```
TC1 = { north-america, south-america }
TC2 = { europe-middle-east, africa }
TC3 = { south-west-pacific, asia }
```

## Core functions

```
continentOf     : Point → Continent
subZoneOf       : Point → SubZone | ⊥
tcOf            : Point → TC
cityOf          : Point → City
countryOf       : Point → Country
usStateOf       : Point → USState | ⊥

isFlightSegment     : Segment → Bool
isSurfaceSegment    : Segment → Bool
isIntercontinental  : Segment → Bool
isInterTC           : Segment → Bool
crossesAtlantic     : Segment → Bool
crossesPacific      : Segment → Bool

continentsVisited   : Itinerary → Set<Continent>
continentsCharged   : Itinerary → number
freeFlightSegmentsUsed : Continent × Itinerary → number
intercontinentalDepartures : Continent × Itinerary → number
intercontinentalArrivals   : Continent × Itinerary → number
```

## Carrier stack (v0.2)

```
marketingCarrier    : FlightInstance → Carrier
operatingCarrier    : FlightInstance → Carrier
isEligibleExplorerCarrier : Carrier → Bool
isPermittedOperator : FlightInstance → Bool
isPermittedCodeshare : FlightInstance → Bool
isAffiliateOf       : Carrier × Carrier → Bool
```

See [CARRIER-ELIGIBILITY.md](./CARRIER-ELIGIBILITY.md) and [CARRIER-ONTOLOGY-DEBATES.md](./CARRIER-ONTOLOGY-DEBATES.md).

## Key derived rule (§4(h))

```
freeFlightSegmentsUsed(c, I) =
  |{ seg ∈ I : isFlightSegment(seg) ∧ continent(from(seg)) = c
              ∧ continent(to(seg)) = c }|
```

Intercontinental flights count toward the 16-segment total but **not** per-continent free segment allowance.
