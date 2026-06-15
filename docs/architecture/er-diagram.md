# Entity-Relationship Diagram

```mermaid
erDiagram
  ITINERARY ||--o{ SEGMENT : contains
  SEGMENT }o--|| AIRPORT : from
  SEGMENT }o--|| AIRPORT : to
  AIRPORT }o--|| COUNTRY : located_in
  COUNTRY ||--|| CONTINENT : maps_to
  COUNTRY ||--o| SUB_ZONE : optional
  ITINERARY ||--o{ VALIDATION_ISSUE : produces
  VALIDATION_ISSUE }o--|| RULE : references
  RULE ||--o| EVALUATOR : implemented_by
  ITINERARY ||--o| ROUTE_ANALYSIS : analyzed_as

  ITINERARY {
    string originIata
    int segmentCount
  }

  SEGMENT {
    int index
    boolean surface
    string bookingClass
  }

  AIRPORT {
    string iata PK
    string city
    string country
    float latitude
    float longitude
    string usState
  }

  COUNTRY {
    string iso PK
    string explorerContinent
    string trafficZone
  }

  CONTINENT {
    string id PK
    int freeSegmentLimit
  }

  RULE {
    string id PK
    string pdfRef
    boolean enforceInV01
    string category
  }

  VALIDATION_ISSUE {
    string code
    string severity
    string message
  }

  ROUTE_ANALYSIS {
    int continentCount
    string suggestedFareBasis
    string direction
  }
```

## Key relationships

- **Airport → Country → Continent** — resolved via `COUNTRY-MAP.json` and `resolve-airport.ts`
- **Itinerary → Issues** — produced by `evaluateRules()` over v0.1 evaluator registry
- **Rule → Evaluator** — one evaluator per `enforceInV01` rule; traceability in `docs/TRACEABILITY.md`
