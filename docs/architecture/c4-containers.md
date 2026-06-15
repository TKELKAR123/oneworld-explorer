# C4 Level 2 — Containers

```mermaid
flowchart LR
  subgraph browser [Browser]
    WebUI["apps/web\nNext.js"]
  end
  subgraph server [Application]
    API["API routes\n/api/validate\n/api/schedules/*"]
    Core["packages/core\nrule engine"]
    Sched["packages/schedules\nadapters + cache"]
  end
  subgraph data [Data]
    SpecYAML["R3015-formal.yaml"]
    GeoJSON["COUNTRY-MAP.json"]
    Cache["schedule-cache/\nSQLite or JSON"]
    Fixtures["schedule-fixtures/"]
  end
  subgraph external [External free APIs]
    AvStack["Aviationstack"]
    AeroDB["AeroDataBox"]
    OpenFlights["OpenFlights routes\n(static fallback)"]
  end

  WebUI --> API
  API --> Core
  API --> Sched
  Core --> SpecYAML
  Core --> GeoJSON
  Sched --> Cache
  Sched --> Fixtures
  Sched --> AvStack
  Sched --> AeroDB
  Sched --> OpenFlights
```

## Container responsibilities

| Container | v0.1 | v0.2 |
|-----------|------|------|
| `apps/web` | Route builder, validation panel | + flight picker per segment |
| `packages/core` | Rule 3015 geometry + pricing | + carrier/stopover rules with schedule data |
| `packages/schedules` | Stub interface | Live + cached schedule adapters |

Business logic lives **only** in `packages/core`. Web and schedule packages are thin adapters.
