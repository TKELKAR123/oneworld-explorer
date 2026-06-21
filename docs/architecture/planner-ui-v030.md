# Planner UI v0.3.0

RTW route planner UX — itinerary-first left column, route health right column.

## Component tree

```
page.tsx
├── ItineraryPlanner
│   ├── RouteStarters
│   ├── CabinSelector (inline)
│   ├── StopCard × N (dnd-kit)
│   ├── LegCard × N-1
│   └── AgentDetailsPanel
└── RouteHealthPanel
    ├── RouteSummaryHero
    ├── RouteMap (+ legNetworkFeasibility colors)
    ├── ValidationChecklist
    ├── IssuesPanel
    ├── ComplianceReport (details)
    └── SegmentBudgets (details)
```

## Client state (page.tsx)

| State | Purpose |
|-------|---------|
| stops, legTypes, legDetails, stopIntents, ticket, travelClass | Validate payload |
| focusedLegIndex, expandedLegDetails | UI focus / scroll |
| agentDetailsOpen | Agent ticket collapsible |
| result, loading | Validation response |

## Hooks

- `useRouteNetwork(stops, legTypes)` — parallel `GET /api/routes/network` per flight leg

## Lib modules

| Module | Role |
|--------|------|
| `carrier-labels.ts` | IATA → airline name |
| `hub-suggestions.ts` | Hub insert actions |
| `validation-checklist.ts` | Progress rows |
| `plain-issue-copy.ts` | Human issue headlines |
| `route-starters.ts` | SC-001, SC-079 templates |
| `fare-hint.ts` / `outcome-label.ts` | Summary copy |

## RPC sequences

### Validate (unchanged)

`POST /api/validate` with `segments`, `travelClass`, `ticket`, `stopIntents`, optional `validationMode: scheduleComplete`.

### Network batch (client)

Parallel `GET /api/routes/network?from=&to=` on each flight leg when stops change.

## State machine

Idle → Validating (debounce 400ms) → Valid | Warnings | Invalid | Error

See plan `rtw_planner_ux_redesign` for full UX spec and test matrix.
