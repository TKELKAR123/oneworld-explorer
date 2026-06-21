# Dual-view globe (v0.4.2)

## Renderer (v0.5)

See [planning-globe-v050.md](./planning-globe-v050.md) for the current stylized planning globe (country polygons, map style toggle, fullscreen, chain mode).

Legacy note: v0.4.2 shipped WebGL with photorealistic textures; v0.5 replaces that with continent/TC/country polygon styling.

Set `NEXT_PUBLIC_DUAL_VIEW_GLOBE=0` to use single-column layout (globe above next-hops list). Default is **dual view** (list left, globe right on large screens).

## Legacy SVG

The old d3 orthographic SVG disc (`RouteMap.tsx` / prior `GlobeExplorer` canvas) is retired from the planner panel. `RouteMap` remains for types and optional reuse.

## Layout

```
┌──────────────────┬──────────────────────┐
│ Next hops list   │  SVG globe + chrome  │
│ DOH · BA/QR Add  │  [Reset][Zoom][PR]   │
│ JFK · BA/AA Add  │                      │
└──────────────────┴──────────────────────┘
```

## Components

| File | Role |
|------|------|
| `DualViewExplorer.tsx` | Grid wrapper; list left, `GlobeExplorer` right (`hideDestinationsPanel`) |
| `GlobeExplorer.tsx` | Shared chrome, fan arcs, leg arcs, zoom/reset |
| `ExploreDestinationsPanel.tsx` | Sortable next-hop rows with Add + hover highlight |

## WebGL path (future)

Evaluated options for a textured 3D globe:

| Library | Pros | Cons |
|---------|------|------|
| `react-globe.gl` | Great-circle arcs, atmosphere, labels | +Three.js bundle, SSR needs `dynamic()` |
| `three-globe` | Same stack, lower-level | More boilerplate |
| SVG orthographic (current) | Zero extra deps, fast CI | Flat disc, crowded at low zoom |

**Recommendation:** Ship list-first dual layout on SVG first (this spike). Add `react-globe.gl` in a follow-up once hover-sync state is lifted into a shared parent hook.

## Interaction contract

- Hover list row → highlight fan arc (GlobeExplorer internal state; lift to parent when WebGL lands)
- Click row or arc → append stop when chain mode on; re-anchor when off
- Continent filter applies to list and fan data via `/api/routes/destinations`
- Reset view → 100% zoom + rotate to explore anchor

## Migration

1. v0.4.1 — unified build mode, dual layout behind flag, inactive route filter on destinations API
2. v0.5 — optional WebGL globe column; remove SVG once parity proven
3. Delete Explore/Plan toggle and deprecated `globeMode` props after visual baselines updated
