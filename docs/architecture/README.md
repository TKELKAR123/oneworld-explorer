# Architecture — Oneworld Explorer

First-class diagram set for Phase 0/1. Maintained alongside the formal spec.

| Document | Contents |
|----------|----------|
| [c4-context.md](./c4-context.md) | C4 Level 1 — users, system boundary |
| [c4-containers.md](./c4-containers.md) | C4 Level 2 — web, core, schedules, data |
| [domain-er.md](./domain-er.md) | Ontology ER — Itinerary, Segment, Carrier |
| [validate-rpc-sequence.md](./validate-rpc-sequence.md) | `POST /api/validate` flow (v0.1) |
| [schedule-rpc-sequence.md](./schedule-rpc-sequence.md) | `POST /api/schedules/search` flow (v0.2) |
| [itinerary-state-machine.md](./itinerary-state-machine.md) | Builder UI states |

## Requirements data flow

```
PDF → R3015-formal.yaml → evaluators → tests → UI traces
```

See [docs/PROJECT-THESIS.md](../PROJECT-THESIS.md) for the traceability narrative.
