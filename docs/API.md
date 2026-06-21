# API

## POST /api/validate

### Geometry-only (stops)

```json
{
  "travelClass": "economy",
  "stops": ["JFK", "LHR", "DXB", "SIN", "SYD", "LAX", "JFK"],
  "legTypes": ["flight", "flight", "flight", "flight", "flight", "flight"]
}
```

### Enriched segments (carriers, schedule, RBD)

```json
{
  "travelClass": "economy",
  "segments": [
    {
      "from": "JFK",
      "to": "LHR",
      "marketingCarrier": "BA",
      "operatingCarrier": "BA",
      "rbd": "L",
      "departureTime": "2026-06-01T10:00:00Z"
    }
  ],
  "ticket": {
    "validatingCarrier": "BA",
    "saleMarket": "US",
    "purchasedBeforeDeparture": true,
    "pnrHasOsiRtw": true,
    "reservationDate": "2026-05-01T00:00:00Z",
    "ticketingCompleteDate": "2026-05-10T00:00:00Z"
  }
}
```

Response: `{ valid, outcome, rulesVersion, issues[], ruleEvaluations[], analysis }`

Rules requiring carrier, schedule, or ticket data use `whenTriggered` applicability — they pass vacuously when optional fields are omitted.

### Segment fields

| Field | Enables |
|-------|---------|
| `marketingCarrier` / `operatingCarrier` | §4 carriers, codeshare, affiliates, §9 transfers, §15 Cuba |
| `departureTime` / `arrivalTime` | §6 min stay, §7 max stay, §8 stopovers |
| `rbd` | §5(b) booking class |
| `groundTransport` | §4 no BA/QF ground transport |
| `surface` | §4(g) surface sectors |

### Ticket fields

| Field | Enables |
|-------|---------|
| `validatingCarrier` | §15 stock |
| `saleMarket` | §0 IONE3 markets (when fare basis is IONE3) |
| `purchasedBeforeDeparture` | §0 purchase |
| `reservationDate` + `ticketingCompleteDate` | §5(a) ticketing deadline (with segment times) |
| `pnrHasOsiRtw` | §5(a) OSI |

### `analysis.originReturn` (v0.1.4)

| Field | Type | Description |
|-------|------|-------------|
| `originIata` | string | First stop |
| `returnIata` | string | Last stop |
| `originCountry` | string? | ISO country of origin |
| `returnCountry` | string? | ISO country of return |
| `mode` | `closedLoop` \| `openJaw` \| `openJawPending` | How origin/return relate under §4(c) |
| `openJawType` | string? | e.g. `within-origin-country` when `mode === openJaw` |
| `openJawLabel` | string? | Human label, e.g. "Within country of origin (§4c-a)" |
| `requiresSurface` | boolean | Always `false` for valid open jaws (implicit O-D gap) |
| `pendingHint` | string? | When `openJawPending` — no permitted §4(c) pair |


### `scheduleSummary` (v0.2)

Present when the client sends `legScheduleStates` or enriched segment times/carriers.

| Field | Type | Description |
|-------|------|-------------|
| `mode` | `geometry` \| `scheduleComplete` \| `partialSchedule` | Whether booking-time rules are fully active |
| `legs` | `LegScheduleState[]` | Per-leg attach/search status for the builder |
| `bookingRulesActive` | boolean | `true` when §5–§9 and hard §4(f) checks run |
| `missingForBookingRules` | string[]? | Human hints when `mode === partialSchedule` |

Top-level `ValidationResult` also includes `outcome` (`valid` \| `invalid` \| `validWithWarnings`) and optional `scheduleSummary`.

### `validationPhase` (v0.4)

| Field | Type | Description |
|-------|------|-------------|
| `validationPhase` | `building` \| `ticketReady` | Inferred from itinerary completeness unless overridden |
| `guidanceIssues` | `ValidationIssue[]?` | Non-blocking hints while `building` (severity `info`) |
| `suppressedIssueCodes` | `string[]?` | Rule codes hidden during `building` (e.g. `R3015-4a`) |

Optional request fields:

```json
{
  "clientPhase": "building",
  "validationPhase": "ticketReady"
}
```

When `building`, ocean crossing, continent minimum, direction, and segment-count errors are suppressed until the route has a return airport, ≥3 continents, and ≥4 filled stops.


### `ruleEvaluations[]` (v0.1.3+)

Each row includes `applicability` (`active` \| `notApplicable`), `ruleKind` (`tariff` \| `exception` \| `advisory`), and optional `displayGroup`.

### `scheduleSummary` (v0.2)

Returned when the itinerary is built from stops or enriched segments.

| Field | Type | Description |
|-------|------|-------------|
| `mode` | `geometry` \| `partialSchedule` \| `scheduleComplete` | Schedule data completeness |
| `bookingRulesActive` | boolean | Whether §6–§9 booking rules are actively evaluated |
| `legs` | `LegScheduleState[]` | Per-leg flight attach status |
| `missingForBookingRules` | `string[]`? | User-facing hints when booking rules are inactive |

Request fields `validationMode`, `stopIntents`, and segment times control schedule-complete and provisional §8 modes. See [validate-rpc-v020.md](architecture/validate-rpc-v020.md).

## GET /api/routes/network (zero-API)

```
GET /api/routes/network?from=LHR&to=JFK
```

Response:

```json
{
  "from": "LHR",
  "to": "JFK",
  "directCarriers": ["BA", "AA"],
  "hasDirect": true,
  "suggestedHubs": [],
  "source": "flightsfrom-weekly",
  "asOf": "2026-06-21",
  "disclaimer": "Weekly FlightsFrom-derived route index — may not reflect seasonal service..."
}
```

When no direct eligible route exists, `suggestedHubs[]` lists up to three 1-stop hub paths from offline BFS on the OpenFlights index. No external HTTP.

## GET /api/routes/graph/nodes (globe atlas)

Returns all oneworld-network airports with coordinates for globe rendering.

## GET /api/routes/destinations (globe explore fan)

```
GET /api/routes/destinations?from=JFK&limit=60&continent=asia
```

Returns 1-hop eligible destinations from an anchor airport (truncated to `limit`, default 60).

## GET /api/routes/inspiration (golden route overlays)

Returns catalog template routes with coordinates for optional ghost overlays on the globe.

## POST /api/schedules/search (dormant)

**Default:** returns `{ provider: "disabled", flights: [], scheduleOnly: true }` — live search is not used in the UI.

Set `SCHEDULE_LIVE=1` and provider keys (see `.env.example` appendix) to enable Aviationstack/AeroDataBox adapters for development only.

```json
{ "from": "LHR", "to": "SIN", "date": "2026-09-15" }
```
