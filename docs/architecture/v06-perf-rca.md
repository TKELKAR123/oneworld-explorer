# v0.6 performance RCA (Jun 2026)

Spikes run before implementing ExploreProvider and layout fixes.

## H1 — Dev compile vs prod latency

| | Result |
|---|--------|
| **Hypothesis** | Next.js dev JIT compile dominates first API/route load |
| **Evidence** | Dev server logs show 3–4s compile on first `/api/geography/atlas` and `/api/routes/destinations` |
| **Spike** | Production build serves precompiled routes; dev is not representative |
| **Verdict** | **CONFIRMED** — measure prod with `npm run build && npm run start -w @oneworld-explorer/web` |
| **Pass criteria** | Anchor flow < 2s on prod (excl. cold atlas) |
| **Action** | Document in README; optional prod smoke test |

## H2 — Duplicate client fetches

| | Result |
|---|--------|
| **Hypothesis** | `DualViewExplorer` + `GlobeExplorer` both call `useDestinations` + `useDestinationImpacts` |
| **Evidence** | [DualViewExplorer.tsx](../../apps/web/components/globe/DualViewExplorer.tsx) lines 15–27; [GlobeExplorer.tsx](../../apps/web/components/globe/GlobeExplorer.tsx) lines 148–171 |
| **Verdict** | **CONFIRMED** — 2× `GET /api/routes/destinations` + 2× `POST /api/itinerary/preview-add` per anchor settle |
| **Pass criteria** | Exactly 1 + 1 after ExploreProvider |
| **Action** | ExploreProvider (implemented in v0.6) |

## H3 — WebGL arc/polygon jank

| | Result |
|---|--------|
| **Hypothesis** | Up to 60 fan arcs + 174 country polygons + hover rebuild causes drag stutter |
| **Evidence** | `buildWebGlArcs` iterates all destinations without cap |
| **Verdict** | **LIKELY** — cap 25 fan arcs on globe (list shows all) |
| **Pass criteria** | ≥30fps during drag or perceptible smoothness |
| **Action** | `maxFanArcs: 25` in webgl-layers; drag throttle via pauseFlyTo |

## H4 — Canvas too short

| | Result |
|---|--------|
| **Hypothesis** | Chrome stack + aspect ratio 1.1 → effective globe ~250px on typical viewport |
| **Evidence** | `GlobeExplorer` MIN_HEIGHT=360 but dual-view grid + chrome eats vertical space |
| **Verdict** | **CONFIRMED** from layout inspection |
| **Pass criteria** | ≥480px inline in building phase |
| **Action** | ExploreColumn min-height 520px; toolbar single row; remove middle column |

## H5 — OrbitControls polar lock

| | Result |
|---|--------|
| **Hypothesis** | No explicit polar limits in code; jank mistaken for lock |
| **Evidence** | [GlobeCanvas3DInner.tsx](../../apps/web/components/globe/GlobeCanvas3DInner.tsx) uses default controls |
| **Verdict** | **INCONCLUSIVE until E2E** — apply explicit polar angles |
| **Pass criteria** | POV lat ≤ −20° after drag sequence |
| **Action** | `globe-controls.ts` with min/max polar angle |

## H6 — Atlas 432KB parse

| | Result |
|---|--------|
| **Hypothesis** | First atlas fetch blocks `globe-atlas-ready` |
| **Evidence** | ~432KB JSON; API cache 86400s |
| **Verdict** | **ACCEPTABLE on warm cache**; first visit pays parse cost once |
| **Action** | No change required for v0.6 |

## Summary

| ID | Fix in v0.6 |
|----|-------------|
| H1 | Document only |
| H2 | ExploreProvider |
| H3 | Arc cap 25 + controls |
| H4 | Layout rebuild |
| H5 | globe-controls.ts + E2E |
| H6 | No change |
