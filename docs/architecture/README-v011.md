# Architecture — v0.1.1

See also [c4-context.md](./c4-context.md), [validate-rpc-sequence.md](./validate-rpc-sequence.md).

## v0.1.1 additions

- **Stop-list domain model** — `stops[]` + `legTypes[]` → `buildItineraryFromStops`
- **Rule evaluation trace** — `ruleEvaluations[]` with pass + fail evidence
- **Validation outcomes** — `valid` | `validWithWarnings` | `invalid`
- **OurAirports pipeline** — `scripts/build-airports.ts` → `data/airports.generated.json`

## Builder state machine

See [builder-state-machine.md](./builder-state-machine.md).

## Explainability data flow

See [explainability-data-flow.md](./explainability-data-flow.md).

## Validate RPC v0.1.1

See [validate-rpc-v011.md](./validate-rpc-v011.md).
