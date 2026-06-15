# Itinerary State Machine

```mermaid
stateDiagram-v2
  [*] --> Empty

  Empty --> Drafting : user adds first segment
  Drafting --> Drafting : add / edit / remove segment
  Drafting --> Validating : validate clicked or debounced

  Validating --> Drafting : edit segments
  Validating --> StructurallyValid : no error-severity issues
  Validating --> Drafting : errors shown in trace panel

  StructurallyValid --> SelectingFlights : attach schedule (v0.2)
  SelectingFlights --> FullyValidated : all segments have flights + carrier OK

  StructurallyValid --> Validating : re-validate after edit
  SelectingFlights --> Validating : route geometry changed
  FullyValidated --> Validating : segment or schedule changed

  note right of StructurallyValid
    v0.1 terminal state —
    geometry + Rule 3015
    enforceInV01 rules pass
  end note

  note right of FullyValidated
    v0.2 terminal state —
    adds carrier, RBD,
    stopover timing checks
  end note
```

## State definitions

| State | v0.1 | Description |
|-------|------|-------------|
| Empty | ✓ | No segments entered |
| Drafting | ✓ | User building airport-level route |
| Validating | ✓ | Core engine running |
| StructurallyValid | ✓ | All v0.1 rules pass (errors cleared) |
| SelectingFlights | v0.2 | User picking real flights per segment |
| FullyValidated | v0.2 | Schedules attached; extended rules enforced |

Warnings (e.g. `R3015-4f-usa-exception` without schedule timestamps) do not block `StructurallyValid`.
