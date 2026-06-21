# Schedule data research — zero-API repositioning

## Product stance (2026)

Oneworld Explorer is a **Rule 3015 compliance explorer**, not a flight search engine.

| Tier | Source | Cost | Role |
|------|--------|------|------|
| **1** | Jonty/FlightsFrom weekly JSON (see [ROUTE-NETWORK-SOURCES-SPIKE.md](./ROUTE-NETWORK-SOURCES-SPIKE.md)) + overrides + ADS-B fixture | Free | Direct eligible carriers + 1-stop hub hints (**~weekly**) |
| **1 legacy** | OpenFlights `routes.dat` (~**June 2014**) | Free (ODbL) | Historical fallback only |
| **2** | User paste (booking panel) | Free | Dep/arr times, carriers, RBD → full §6–§9 |
| **3** | Self-declared stop intent | Free | Provisional §8 hints when times unknown |
| **4** | Google Flights / FlightsFrom / FlightConnections **links** | Free to us | User searches externally; copies into Tier 2 |

**Default UX makes zero outbound schedule API calls.**

## Route data integration research (Jun 2026)

Spikes validated external options for fresher network data:

| Method | Verdict | Doc |
|--------|---------|-----|
| Kiwi Tequila `/data/routes` bulk seed | **NO-GO** — endpoint 404 | [KIWI-ROUTES-SPIKE.md](./KIWI-ROUTES-SPIKE.md) |
| Google Flights scrape | **DEFER** — post bugfix parsing works; §4(j) gap | [GOOGLE-FLIGHTS-SCRAPE-SPIKE.md](./GOOGLE-FLIGHTS-SCRAPE-SPIKE.md) |
| **Decision** | **Jonty/FlightsFrom weekly adopted** | [ROUTE-DATA-INTEGRATION-DECISION.md](./ROUTE-DATA-INTEGRATION-DECISION.md) |

Benchmark corpus: `data/fixtures/route-benchmark-corpus.json` (60 routes).  
Baseline scorecard: [route-benchmark-baseline.md](./route-benchmark-baseline.md) — FlightsFrom weekly recall **≥92%**, false-active **0%** with inactive overrides.

Research scripts: `scripts/score-route-benchmark.ts`, `scripts/spike-kiwi-routes.ts`, `scripts/spike-google-flights/`.

**Network source spike (20 ideas):** [ROUTE-NETWORK-SOURCES-SPIKE.md](./ROUTE-NETWORK-SOURCES-SPIKE.md) — **Jonty/FlightsFrom weekly JSON recommended** over 2014 OpenFlights.

## FlightsFrom weekly index (Tier 1 — primary)

- Upstream: [Jonty/airline-route-data](https://github.com/Jonty/airline-route-data) (`airline_routes.json`, refreshed ~weekly)
- Fetch: `npm run fetch:routes-vendor` → local vendor (gitignored)
- Build: `npm run build:routes` → `data/eligible-routes.index.json` + network graph artifacts
- Full refresh: `npm run refresh:routes`
- Metadata: `data/routes-source.meta.json` (`fetchedAt`, upstream SHA256)
- API: `GET /api/routes/network?from=&to=`
- Static network only — no dates, times, or seasonal service guarantees
- Attribution: same [FlightsFrom.com](https://www.flightsfrom.com) source we link to for per-leg timetables

## OpenFlights (legacy — removed from build)

- Previously used 2014 `routes.dat`; superseded by FlightsFrom weekly index (Jun 2026)

## ADS-B hybrid (v0.4 — observed routes)

- Fixture slice: `data/fixtures/adsb-routes-q1-2026.json` (CI-safe, no 1GB download)
- Spike: `tsx scripts/spike-adsb-routes.ts`
- Import merge: `tsx scripts/import-adsb-routes.ts` (optional `--write` to patch index)
- Overrides: `data/route-overrides.json` — `inactive: true` blocklist (e.g. NRT↔JFK)
- Network API adds `confidence`: `observed` \| `historical` \| `inactive`, plus `planningHint`

Merge precedence: **inactive override** > **adsb-observed** > **flightsfrom-weekly** > **manual-seasonal**.

## External search (Tier 4)

Primary per-leg: [Google Flights](https://www.google.com/travel/flights) deep links (`q=` query — no scraping).

Secondary: FlightsFrom weekly timetables, FlightConnections route map.

Holistic CTA: [rtw.oneworld.com](https://rtw.oneworld.com/) official RTW booking tool.

## Live providers (dormant appendix)

Aviationstack and AeroDataBox adapters remain in `packages/schedules` for optional dev use only:

- Gate: `SCHEDULE_LIVE=1` on `POST /api/schedules/search`
- Not exposed in UI; keys documented in `.env.example` appendix only

| Provider | Verdict |
|----------|---------|
| Aviationstack / AeroDataBox | Dormant — tiny free tier, wrong product fit |
| Amadeus self-service | Reject — sunset Jul 2026 |
| Kiwi Tequila `/data/routes` | **Reject (Jun 2026 spike)** — endpoint 404, no API key; Search API untested |
| Google Flights scraping | **Defer (Jun 2026 spike)** — parsing works (post bugfix); operating carrier + ToS block production; see GOOGLE-FLIGHTS-SCRAPE-SPIKE.md |
| Parse.bot / unofficial scrapers | Reject |

## v0.1 status

Geometry-only validation in `@oneworld-explorer/core`. `@oneworld-explorer/schedules` exports FlightsFrom weekly index + graph; live adapters behind env flag.

## Refresh cadence

- FlightsFrom weekly index: GitHub Action `.github/workflows/refresh-routes-weekly.yml` (Mondays 06:00 UTC) opens PR with rebuilt artifacts
- Manual: `npm run refresh:routes`
- CI gate: benchmark recall ≥90% on committed index
- Tag `source: flightsfrom-weekly` in network API responses
