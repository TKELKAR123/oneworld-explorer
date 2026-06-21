# Globe Explorer v0.4

Interactive globe for RTW route discovery on top of the v0.3 planner.

## Modes

| Mode | Behavior |
|------|----------|
| **Explore** | 889 oneworld-network airport dots; click to fan outbound routes; add stops from panel |
| **Plan** | Itinerary arcs only (legacy map view) |

## Component tree

```
RouteHealthPanel
└── GlobeExplorer
    ├── GlobeExplorerChrome (mode, search, filters, spine/inspiration toggles)
    ├── GlobeCanvas (SVG orthographic + layers)
    │   ├── SpineLayer (optional hub backbone)
    │   ├── InspirationLayer (catalog ghosts)
    │   ├── HubGhostLayer (dashed via-hub for blocked legs)
    │   ├── ExploreFanLayer (≤60 arcs from anchor)
    │   ├── ItineraryArcsLayer (committed route)
    │   └── AirportDotsLayer (network nodes)
    └── ExploreDestinationsPanel
```

## APIs

| Endpoint | Purpose |
|----------|---------|
| `GET /api/routes/graph/nodes` | Network airports + coords |
| `GET /api/routes/destinations?from=` | 1-hop eligible destinations |
| `GET /api/routes/inspiration` | Golden route overlays |

## Build artifacts

```bash
npm run build:airports
npm run build:routes      # → network-nodes.json, network-edges.json, network-spine.json
npm run build:inspiration # → inspiration-routes.json
```

## Client state (page.tsx)

| State | Purpose |
|-------|---------|
| `globeMode` | `explore` \| `plan` |
| `exploreAnchorIata` | Airport fan origin |
| `selectedStopIndex` | Sync with globe / planner |
| `continentFilter` | Filter destination fan |
| `showSpine` / `showInspiration` | Optional overlays |

## Hooks

- `useNetworkNodes()` — load graph nodes once
- `useDestinations(anchor, continent?)` — debounced fan fetch
