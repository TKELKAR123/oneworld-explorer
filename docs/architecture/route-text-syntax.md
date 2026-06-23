# Route text syntax (FlyerTalk)

Canonical one-line route format for paste/import in the Route text bar.

## Primary form

```
JFK-LHR-DOH-SIN-SYD-LAX-JFK
```

Dash-separated IATA codes; matches **Copy for FlyerTalk** export.

## Alternatives

| Form | Example |
|------|---------|
| Slash | `JFK/LHR/DOH/SIN` |
| Whitespace | `JFK LHR DOH SIN` |
| Connection `(x)` | `JFK-LHR(x)-DOH-SIN` |
| Surface leg | `JFK-LHR-[surface]-PAR` |
| Comment | `# classic RTW` (ignored) |

## API

`POST /api/itinerary/parse-text` — see [API.md](../API.md).

## Core

`parseRouteText` / `formatRouteText` in `@oneworld-explorer/core`.
