# Planning globe v0.5

## Renderer

Stylized **3D planning globe** via `react-globe.gl`:

- Country polygons colored by **Explorer continent**, **TC zone**, **country borders**, or **minimal** outlines (`MapStyleMode`)
- Dark ocean base (no photorealistic Blue Marble)
- Great-circle arcs for next hops, itinerary legs, optional overlays
- Drag to rotate, scroll to zoom, **Expand** for fullscreen overlay

Build geography atlas: `npm run build:geography-atlas` → `data/geography-atlas.generated.json`  
Served at `GET /api/geography/atlas`

## Layout

Dual view default (`NEXT_PUBLIC_DUAL_VIEW_GLOBE !== "0"`): next-hops list left, globe right.

## Primary UX (P0)

- **Chain mode** — segmented control: *Add to route* (default) vs *Explore only*
- **Explore fan** — 1-hop destinations with `previewAddStop` impact badges (network + routing hints)
- **Map style toggle** — continents / TC zones / countries / minimal + legend

## Secondary (collapsed)

- Map overlays `<details>`: hub backbone, golden routes, PR preview

## Components

| File | Role |
|------|------|
| `GlobeCanvas3DInner.tsx` | WebGL globe + polygons + arcs |
| `GlobeExplorer.tsx` | State, fullscreen, impact batching |
| `ChainModeControl.tsx` | Prominent add vs explore toggle |
| `MapStyleToggle.tsx` | Land styling modes + legend |
| `GlobeFullscreenOverlay.tsx` | Viewport expand (Esc closes) |
| `preview-add-stop.ts` (core) | Feasibility preview per candidate stop |

See also [dual-view-globe-spike.md](./dual-view-globe-spike.md) for layout history.
