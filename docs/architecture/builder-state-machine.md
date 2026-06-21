# Builder state machine (v0.2)

```mermaid
stateDiagram-v2
  [*] --> Drafting
  Drafting --> Validating: debounce_or_recheck
  Validating --> Drafting: edit_stops_or_flights
  note right of Drafting
    Per-leg schedule: notSearched | attached | lookupFailed | surface
  end note
  Validating --> Valid: all_rules_pass
  Validating --> ValidWithWarnings: warnings_only
  Validating --> Invalid: blocking_issue
  Validating --> PartialBooking: geometry_ok_schedule_incomplete
  PartialBooking --> Validating: attach_all_flights
  Invalid --> Drafting: apply_fix
  Valid --> Drafting: edit
  ValidWithWarnings --> Drafting: edit
```

- `PartialBooking`: `scheduleSummary.mode === partialSchedule` — amber banner; booking rules not fully active.
- `scheduleComplete`: all flight legs `attached` → §6–§9 and §4(f) hard checks.

UI maps `ValidationResult.outcome` to `TripSummaryStrip` badge colors.
