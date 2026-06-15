# RPC Sequence — Validate Itinerary (v0.1)

```mermaid
sequenceDiagram
  autonumber
  participant C as Client browser
  participant API as POST /api/validate
  participant P as parseRoute
  participant G as resolveAirport
  participant E as evaluate rules
  participant Y as R3015-formal.yaml

  C->>API: segments[] + travelClass
  API->>P: normalize input
  P->>G: resolve each IATA
  G-->>P: Point + Continent + TC
  P->>E: Itinerary model
  E->>Y: load rule registry
  loop each enforceInV01 rule
    E->>E: run predicate + trace
  end
  E-->>API: ValidationResult + traces
  API-->>C: JSON response
```

## Response fields

| Field | Source |
|-------|--------|
| `rulesVersion` | `R3015-formal.yaml` (`2026-02-27`) |
| `issues[].code` | YAML rule `id` |
| `issues[].pdfRef` | YAML `pdfRef` |
| `issues[].category` | YAML `category` |
| `analysis` | `analyzeRoute()` — continents, fare basis, direction |

See [docs/API.md](../API.md) for request/response schema.
