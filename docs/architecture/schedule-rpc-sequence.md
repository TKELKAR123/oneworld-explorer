# RPC Sequence — Search Flights for Segment (v0.2)

```mermaid
sequenceDiagram
  autonumber
  participant C as Client browser
  participant API as POST /api/schedules/search
  participant Cache as schedule-cache
  participant Adp as ScheduleAdapter
  participant Ext as Free API provider
  participant V as validate carrier rules

  C->>API: from, to, date
  API->>Cache: lookup key
  alt cache hit and fresh
    Cache-->>API: FlightInstance[]
  else cache miss
    API->>Adp: search(params)
    Adp->>Ext: HTTP GET
    Ext-->>Adp: raw JSON
    Adp->>Adp: normalize op vs mkt carrier
    Adp-->>API: FlightInstance[]
    API->>Cache: store with TTL
  end
  API->>V: filter ineligible carriers
  V-->>API: flights + warnings
  API-->>C: flights + scheduleDataAsOf
```

## v0.1 status

`POST /api/schedules/search` is **not implemented**. `packages/schedules` exports a stub returning `{ scheduleOnly: true, stub: true }`.

See [docs/research/SCHEDULE-DATA.md](../research/SCHEDULE-DATA.md) for provider evaluation.
