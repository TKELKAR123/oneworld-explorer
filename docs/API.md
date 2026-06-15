# API

## POST /api/validate (v0.1)

```json
{
  "travelClass": "economy",
  "segments": [{ "from": "LHR", "to": "JFK" }]
}
```

Response: `{ valid, rulesVersion, issues[], analysis }`

## POST /api/schedules/search (v0.2)

```json
{ "from": "LHR", "to": "SIN", "date": "2026-09-15" }
```

Response: `{ asOf, flights[], scheduleOnly: true }`
