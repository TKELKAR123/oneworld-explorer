# Domain Model — Ontology ER View

```mermaid
erDiagram
  Itinerary ||--|{ Segment : contains
  Segment ||--o| FlightInstance : binds
  FlightInstance ||--|| CarrierRole_Marketing : has
  FlightInstance ||--|| CarrierRole_Operating : has
  Carrier ||--o{ CarrierClassification : classified_as
  Carrier ||--o{ AffiliateRelationship : parent_of
  Point ||--|| Country : in
  Point ||--|| Continent : maps_to
  Point ||--|| TrafficZone : maps_to
  Country ||--|| Continent : explorer_map
  Segment }o--|| Point : from
  Segment }o--|| Point : to

  Carrier {
    string iata
    string name
  }
  CarrierClassification {
    enum kind "eligible_explorer|affiliate|codeshare_exception|prohibited|unknown"
    string pdfRef
  }
  FlightInstance {
    string flightNumber
    datetime departureTime
    datetime arrivalTime
    string equipment
  }
  Segment {
    bool surface
  }
```

## v0.1 vs v0.2

| Sort | v0.1 | v0.2 |
|------|------|------|
| `Segment` | `{ from, to, surface? }` | + optional `flight: FlightInstance` |
| `FlightInstance` | Not required | Marketing + operating carrier, times |
| Carrier predicates | Documented, warn-only | Enforced from schedule data |

See [docs/rules/PREDICATES.md](../rules/PREDICATES.md) for formal function signatures.
