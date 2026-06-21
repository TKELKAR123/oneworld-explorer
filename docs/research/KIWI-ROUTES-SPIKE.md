# Kiwi Static Routes spike — Method A

**Date:** 2026-06-19  
**Verdict:** **NO-GO** for the research note's `/data/routes` bulk-seed approach  
**API key used:** **None** — `KIWI_TEQUILA_API_KEY` was not set in `.env.local`  
**Spike scripts:** `scripts/spike-kiwi-routes.ts`, `scripts/compare-route-sources.ts`

---

## Executive summary

The research note claims Kiwi Tequila offers an unrestricted **Static Routes API** at `GET /data/routes?airline={IATA}`. **This endpoint does not exist** on the public Tequila API host (`api.tequila.kiwi.com`). All probed static-route paths return **HTTP 404**. Without a valid API key we could not fully exercise authenticated alternate paths, but the 404 responses occur even when probing with a placeholder key — the routes are not registered on this host.

Method A as described (**"$0 uncapped overnight seed"**) **fails the go/no-go gate** from the research plan. Kiwi remains usable only via the documented **Search API** (`/v2/search`), which is per-query, date-bound, and subject to affiliate rate limits — not a static matrix dump.

**Recommendation:** Keep OpenFlights + ADS-B fixture + manual overrides for Tier 1 network hints. Revisit Kiwi only if Tequila publishes a documented bulk routes endpoint or if affiliate terms allow systematic Search API sweeps within free-tier quotas (separate spike required with a real key).

---

## 1. Endpoint verification

Probe executed via `npx tsx scripts/spike-kiwi-routes.ts --probe-only` (also embedded in full spike run).

| Path | HTTP | Body preview |
|------|------|--------------|
| `/data/routes?airline=BA` | **404** | `{"detail":"Not Found"}` |
| `/routes?airline=BA` | **404** | `{"detail":"Not Found"}` |
| `/v2/routes?airline=BA` | **404** | `{"detail":"Not Found"}` |
| `/data/airlines` | **404** | `{"detail":"Not Found"}` |
| `/locations/query?term=BA&location_types=airline` | **401** | `Unauthorized` (endpoint exists; needs valid key) |

Fixture: `tests/schedules/fixtures/kiwi-endpoint-probe.json`

### Fallback hypothesis (not tested — no API key)

If a Tequila affiliate key were available, the viable Kiwi path for route discovery would be:

- `GET /v2/search?fly_from={IATA}&fly_to={IATA}&date_from=…&date_to=…`
- Requires **per-OD-pair × date-window** queries across the eligible carrier network
- Likely includes **virtual interlining** (non-oneworld connections) — must filter to marketing/operating carriers in `CARRIER-REGISTRY.json`
- Free-tier rate limits unknown without key; unlikely to support uncapped global seed

---

## 2. Carrier coverage attempt

Spike iterated all **16 eligible carriers** from `data/CARRIER-REGISTRY.json` (not the research note's 14):

`AA, AS, AT, AY, BA, CX, FJ, IB, JL, MH, NU, QF, QR, RJ, UL, WY`

Without `KIWI_TEQUILA_API_KEY`, fixtures record the missing-key state:

- `tests/schedules/fixtures/kiwi-routes-{carrier}.json` (16 files)
- `tests/schedules/fixtures/kiwi-routes-summary.json`

**Kiwi route keys loaded:** 0  
**OpenFlights merged keys:** 6,882

---

## 3. Schema → RoutePair mapping (theoretical)

If `/data/routes` existed, the research note maps:

```json
{
  "airline": "BA",
  "flight_no": "178",
  "route_from": "LHR",
  "route_to": "JFK"
}
```

Target project shape (`packages/schedules/src/openflights-routes.ts`):

```typescript
{ carrier, from, to, source: "kiwi-static", note?, inactive?, lastSeenQuarter? }
```

| Field need | Kiwi (claimed) | Fit |
|------------|----------------|-----|
| OD pair | Yes | Good for Tier 1 network hints |
| Flight number | Claimed | Not needed for graph; useful for schedule tier |
| Operating carrier | Unknown | **Required for §4(j)** — not confirmed |
| Directionality | Unknown | Graph is directed; must store both directions |
| Virtual interlining | Risk on Search API | Must exclude non-eligible marketing carriers |

---

## 4. Benchmark comparison

Full table: `docs/research/kiwi-benchmark-comparison.md`  
Baseline: `docs/research/route-benchmark-baseline.md` (OpenFlights recall **88.9%**, false-active **0%** with inactive overrides)

With zero Kiwi data, comparison shows:

| Outcome | Count |
|---------|-------|
| OpenFlights-only (should-appear) | 24 |
| Kiwi-only better (inactive pairs absent in OF) | 4 |
| Both | 0 |
| Neither | 3 |

Kiwi cannot beat OpenFlights until a working data source exists.

---

## 5. Operational feasibility

| Criterion | Assessment |
|-----------|------------|
| $0 uncapped seed | **Failed** — no static dump endpoint |
| Monthly refresh | N/A without data source |
| CI | Fixtures committed; live key optional in `.env.local` |
| License / redistribution | Tequila affiliate terms not evaluated — no data obtained |
| Merge precedence | Proposed `kiwi-static > openflights-historical` — **not implemented** |

---

## 6. Go / no-go decision

| Gate | Result |
|------|--------|
| Bulk static route dump exists | **NO** |
| Maps to RoutePair without SQLite | Yes (JSON index) — moot |
| Beats OpenFlights recall ≥95% | **Not testable** |
| False-active ≤2% | **Not testable** |
| $0 operational cost at scale | **Unlikely** via Search API alone |

**Decision: NO-GO** for Method A as specified. Optional follow-up: spike Search API with real `KIWI_TEQUILA_API_KEY` on 10 trunk OD pairs from benchmark corpus to measure virtual-interlining pollution and rate limits.

---

## 7. How to re-run

```bash
# Add to .env.local:
# KIWI_TEQUILA_API_KEY=your_key

npx tsx scripts/spike-kiwi-routes.ts --probe-only
npx tsx scripts/spike-kiwi-routes.ts
npx tsx scripts/compare-route-sources.ts --write-doc
npx tsx scripts/score-route-benchmark.ts --write-doc
```
