# Validate RPC v0.2.0

Extends [validate-rpc-v011.md](./validate-rpc-v011.md) with schedule-complete validation, leg schedule state, and enriched response fields.

## POST /api/validate

### Request (schedule-complete)

```json
{
  "travelClass": "economy",
  "stops": ["JFK", "LHR", "DXB", "SIN", "SYD", "LAX", "JFK"],
  "legTypes": ["flight", "flight", "flight", "flight", "flight", "flight"],
  "validationMode": "scheduleComplete",
  "legScheduleStates": [
    {
      "legIndex": 0,
      "status": "attached",
      "attachedFlight": {
        "id": "ba117",
        "legIndex": 0,
        "marketingCarrier": "BA",
        "operatingCarrier": "BA",
        "operatingCarrierSource": "api",
        "flightNumber": "117",
        "departureTime": "2026-06-01T10:00:00Z",
        "arrivalTime": "2026-06-01T22:00:00Z",
        "provider": "aviationstack"
      }
    }
  ],
  "ticket": {
    "validatingCarrier": "BA",
    "purchasedBeforeDeparture": true
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `validationMode` | `geometry` \| `scheduleComplete` | Force geometry-only or schedule-complete booking rules |
| `legScheduleStates` | `LegScheduleState[]` | UI flight-picker state; merged into segments when attached |

Legacy `segments[]` with `departureTime` / `arrivalTime` still supported.

### Response (extended v0.2)

```json
{
  "valid": true,
  "outcome": "valid",
  "blockingIssueCount": 0,
  "warningCount": 0,
  "rulesVersion": "2026-02-27",
  "issues": [],
  "ruleEvaluations": [
    {
      "ruleId": "R3015-8-stopovers",
      "passed": true,
      "severity": "info",
      "category": "ticketing",
      "applicability": "active",
      "ruleKind": "tariff",
      "displayGroup": "ticketing",
      "pdfRef": "§8",
      "naturalLanguage": "..."
    }
  ],
  "analysis": { "originReturn": { "mode": "closedLoop" } },
  "scheduleSummary": {
    "mode": "scheduleComplete",
    "bookingRulesActive": true,
    "legs": [],
    "missingForBookingRules": []
  }
}
```

### `scheduleSummary`

| Field | Type | Description |
|-------|------|-------------|
| `mode` | `geometry` \| `partialSchedule` \| `scheduleComplete` | How much schedule data is present |
| `bookingRulesActive` | boolean | `true` when §6–§9 booking rules are evaluated (not vacuous) |
| `legs` | `LegScheduleState[]` | Per-leg attach status from request or inferred from segment times |
| `missingForBookingRules` | `string[]`? | Hints when `mode !== scheduleComplete` |

### Applicability

Each `ruleEvaluation` includes:

| Field | Values | Meaning |
|-------|--------|---------|
| `applicability` | `active` \| `notApplicable` | `notApplicable` when optional trigger data is missing |
| `ruleKind` | `tariff` \| `exception` \| `advisory` | Rule classification |
| `displayGroup` | string | UI grouping key |

When `scheduleSummary.mode === scheduleComplete`, §4(f) USA exception and §8 stopover rules evaluate as blocking failures (not warnings) when they fail.

## POST /api/schedules/search

See [API.md](../API.md#post-apischedulessearch-v02).
