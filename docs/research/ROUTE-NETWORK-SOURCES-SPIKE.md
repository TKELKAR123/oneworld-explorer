# Route network sources — 20 ideas spiked (Jun 2026)

**Question:** OpenFlights is frozen at **June 2014**. Is there any free path to a fresher oneworld route network?

**Answer:** Yes — **[Jonty/airline-route-data](https://github.com/Jonty/airline-route-data)** (weekly FlightsFrom scrape) beats OpenFlights on our benchmark and fixes WY/AT gaps. Best path: **replace OpenFlights bootstrap with Jonty JSON** in `npm run build:routes`, keep manual overrides.

---

## Executive summary

| Source | Fresh? | Free? | Spike result |
|--------|--------|-------|--------------|
| **Jonty / FlightsFrom weekly JSON** | **~Weekly (May 2026)** | **Yes** | **WINNER — 92.6% benchmark recall, WY+AT, no NRT↔JFK false positive** |
| OpenFlights routes.dat | **2014** | Yes | 88.9% recall; WY missing; stale false positives |
| Self-scrape FlightsFrom (Jonty script) | Weekly | Yes | Same data; CF/rate-limit ops burden |
| MrAirspace ADS-B quarterly Parquet | 2026-Q1 observed | Yes | 801MB/quarter; observed not scheduled |
| Google Flights / gf-search | Live | Yes | Per OD+date only — **not a network matrix** |
| Kiwi Tequila | — | Affiliate gate | `/data/routes` 404; no key |
| AirLabs / Aviation Edge / Logostream | Current | Free tier + key | 401 without key |
| FlightConnections / AirportRoutes | Current | Scrape | 403 / Cloudflare |
| Manual `route-overrides.json` | Current | Yes | Still needed for seasonal/inactive |

**Recommended stack:**

```
Jonty airline_routes.json (weekly pull)
  → filter CARRIER-REGISTRY eligible
  → merge route-overrides.json (inactive > seasonal)
  → eligible-routes.index.json + network graph
Optional: quarterly ADS-B slice for confidence: observed
```

---

## The 20 ideas (spiked)

| # | Idea | Spike | Verdict |
|---|------|-------|---------|
| 1 | **OpenFlights `routes.dat`** | Downloaded; upstream warns June 2014 | **Baseline only — 12 years stale** |
| 2 | **Jonty `airline-route-data`** | Downloaded 22MB JSON; expanded 6,797 eligible pairs | **✅ USE THIS** |
| 3 | **Self-scrape FlightsFrom** | Jonty's `scrape_airline_routes.py` uses `flightsfrom.com/airports` + `/{IATA}/destinations` | **Same as #2; run yourself if Jonty stops** |
| 4 | **FlightsFrom links (existing)** | Already in `external-search-links.ts` | **Per-leg timetables, not bulk — same source as Jonty** |
| 5 | **Google Flights hub fan-out** | No destinations-list API | **Cannot build matrix cheaply** |
| 6 | **gf-search / fast-flights** | Works per leg; 21/30 queries | **Leg autofill, not network atlas** |
| 7 | **Kiwi Tequila static routes** | 404 without affiliate | **Blocked for you** |
| 8 | **Kiwi Search API** | Needs affiliate key | **Not tested — signup blocked** |
| 9 | **AirLabs routes API** | `Missing api_key` | **Needs key; 50 rows/free** |
| 10 | **Aviation Edge routes** | `Missing API Key` | **Needs key** |
| 11 | **Logostream Routes API** | 401 `x-api-key` | **Needs key (38k routes claimed)** |
| 12 | **FlightRouteData.com API** | Returns blog post list, not routes | **SEO bait — useless** |
| 13 | **AirportRoutes.com API** | 403 Cloudflare | **Blocked from server** |
| 14 | **FlightConnections scrape** | 403 Forbidden | **Blocked** |
| 15 | **OpenSky Network** | Live states OK; `/routes/all` 404 | **ADS-B flights, not route catalog; NC license** |
| 16 | **MrAirspace ADS-B schedules** | Q1 2026 Parquet 801MB downloaded | **Observed flights; heavy; good for `observed` tier** |
| 17 | **vradarserver standing-data** | `routes/schema-01/` A–N shards | **Callsign→route supplement; not full network** |
| 18 | **BTS TranStats US routes** | HTTP 500 | **Down/broken during spike** |
| 19 | **Wikidata SPARQL airline routes** | Empty bindings | **No usable route graph** |
| 20 | **Manual network + overrides** | `route-overrides.json` today | **Still required for inactive/seasonal edge cases** |

---

## Jonty deep spike (idea #2)

**Source:** https://github.com/Jonty/airline-route-data  
**Updated:** GitHub `pushed_at` **2026-05-03** (weekly automation)  
**Method:** Scrapes [FlightsFrom.com](https://www.flightsfrom.com) airport destination pages (same site we already link to for timetables).

**Schema:** Airport-indexed JSON → `routes[]` with `{ iata, km, min, carriers[{iata, name}] }`.

### vs OpenFlights (eligible pairs)

| Metric | OpenFlights | Jonty |
|--------|-------------|-------|
| Eligible carrier OD pairs | 6,882 merged | **6,797** |
| Overlap | — | **3,907** |
| Only in Jonty (newer) | — | **2,890** |
| Only in OpenFlights (stale) | **2,973** | — |

### Benchmark corpus (`should-appear`)

| Dataset | Recall |
|---------|--------|
| OpenFlights | **88.9%** (25/27) |
| Jonty | **92.6%** (25/27) |

### Known fixes vs OpenFlights

| Route | OpenFlights | Jonty |
|-------|-------------|-------|
| WY MCT→LHR | **Missing** | **YES** (102 WY routes total) |
| AT CMN→JFK | Present | **YES** (321 AT routes) |
| AA/JL NRT→JFK (ended) | In index (needs override) | **Correctly absent** |
| NU OKA→HND | Missing | Missing (HND→OKA shows JL/NH not NU) |

### Sample Jonty-only routes (not in OpenFlights)

`AA-ABE-ORD`, `QR-ABJ-DOH`, `AS-ABQ-SEA`, `AT-ABV-CMN`, `QF-ABX-BNE`

### Caveats

- **Outbound-only per airport** — need reverse edges or treat graph as undirected for BFS.
- **All carriers on a city-pair** — not oneworld-only until filtered.
- **No license file** in repo — verify FlightsFrom ToS before redistributing; attribution recommended.
- **Scrape dependency** — if FlightsFrom changes UI, Jonty breaks (same risk if you self-scrape).
- **Seasonal routes** — may appear year-round in FlightsFrom; still need `manual-seasonal` overrides.

---

## Other promising paths (secondary)

### MrAirspace ADS-B (idea #16)

- Release: `aircraft_flight_schedules_2026_quarter1` (Parquet ~801MB)
- **Observed** flights from ADS-B, not published schedules
- Good for **`confidence: observed`** tier (you already have a Q1 2026 fixture slice)
- Pipeline: quarterly download → aggregate `(carrier, from, to)` → merge above Jonty base

### Self-scrape FlightsFrom (idea #3)

Fork Jonty's script if upstream stops:

```bash
pip install curl_cffi lxml geopy
python scrape_airline_routes.py  # ~3900 airports × 1s sleep ≈ 1 hour
```

Same ToS considerations as using Jonty's output directly.

### Manual network (idea #20)

Still needed for:
- `inactive: true` (NRT↔JFK-style ended routes Jonty may re-add if FlightsFrom lags)
- `manual-seasonal` hints
- Explorer-specific notes

---

## What does NOT solve the network layer

- **Google Flights** — shopping engine, not “all destinations from DOH”
- **Kiwi** — affiliate gate + no static dump
- **Paid APIs without keys** — AirLabs, Aviation Edge, Logostream

---

## Recommended next implementation step

1. Add `scripts/build-routes-jonty.ts` — download `airline_routes.json`, expand `carriers[]`, filter `CARRIER-REGISTRY`, emit `RoutePair[]` with `source: "flightsfrom-weekly"`.
2. Change merge precedence: **inactive override > adsb-observed > flightsfrom-weekly > manual-seasonal > openflights-historical** (or drop OpenFlights entirely).
3. Weekly GitHub Action: curl Jonty JSON → rebuild index → commit or artifact.
4. Update `routeConfidence()` — `flightsfrom-weekly` = higher than `historical`.
5. Update UI copy — "Route index updated weekly from FlightsFrom" (honest).

**Fixture from this spike:** `data/vendor/spikes/jonty-airline_routes.json` (22MB, not committed by default — add to `.gitignore` or commit compressed).

---

## Re-run spikes

```bash
# Jonty download + analysis
curl -o data/vendor/spikes/jonty-airline_routes.json \
  https://raw.githubusercontent.com/Jonty/airline-route-data/main/airline_routes.json

# OpenFlights baseline
npm run research:benchmark

# Google Flights (leg-level, not network)
scripts/spike-google-flights/.venv312/bin/python scripts/spike-google-flights/spike.py
```
