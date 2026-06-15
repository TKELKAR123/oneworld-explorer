# Itinerary Builder State Machine

```mermaid
stateDiagram-v2
  [*] --> Empty
  Empty --> Drafting: add first segment
  Drafting --> Drafting: add/remove/reorder segment
  Drafting --> Validating: trigger validate
  Validating --> Drafting: edit after results
  Validating --> StructurallyValid: all routing rules pass
  StructurallyValid --> SelectingFlights: v0.2 attach flights
  SelectingFlights --> SelectingFlights: pick flight per segment
  SelectingFlights --> FullyValidated: carrier + time rules pass
  Drafting --> Invalid: blocking errors
  Invalid --> Drafting: fix issues
  FullyValidated --> [*]
```

## v0.1 states

| State | User sees |
|-------|-----------|
| `Drafting` | Segment editor, IATA inputs |
| `Validating` | Loading spinner |
| `StructurallyValid` | Green valid + trip summary |
| `Invalid` | Rule traces grouped by category |

`SelectingFlights` and `FullyValidated` require v0.2 schedule integration.
