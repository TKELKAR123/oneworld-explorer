# Google Flights scrape spike — Method B

**Date:** 2026-06-19 (corrected 2026-06-20)  
**Verdict:** **DEFER** — parsing works after bugfix, but §4(j) operating-carrier gap + ToS/ops risk remain  
**Spike scripts:** `scripts/spike-google-flights/spike.py`, `scripts/spike-google-flights/soak.py`, `scripts/spike-google-flights/extract.py`

---

## Executive summary

Initial spike (2026-06-19) reported **0 parsed flights**. That was **wrong** — the extractor looked for `result.flights`, but `fast-flights` returns a `ResultList` that **is the list** (iterate directly). After fixing `extract.py` and re-running:

| Library | Queries | With parsed segments | Errors | Empty |
|---------|---------|----------------------|--------|-------|
| **fast-flights** (PyPI, Python 3.14) | 30 | **21** | 9 (30%) | 0 |
| **gf-search** (Python 3.12, spot-check) | 3 legs | **3/3** | 0 | 0 |

**However:** neither library exposes a distinct **operating carrier** field. `fast-flights` infers marketing from `Flights.type` (e.g. `BA`); `gf-search` returns `airlines: ['JQ']` on SYD→PER (useful for QF/JQ) but LHR→MAN still shows `BA` only — **cannot confirm CJ/A0 affiliate metal** without GF UI “flight details” expansion (not done in this spike).

**Recommendation:** **Defer** production integration. Scraping can return times and marketing-level carriers for autofill experiments behind `SCHEDULE_LIVE=1`, but it does **not** pass the plan’s §4(j) operating-carrier bar and carries ToS/server-IP risk. Default UX stays deep links + user paste.

---

## What was NOT done (honest limits)

| Plan step | Status |
|-----------|--------|
| API keys (Kiwi, commercial) | **None obtained** — see KIWI-ROUTES-SPIKE.md |
| Compare GF operating carrier to **manual UI ground truth** | **Not done** |
| **7-day soak** (50 queries/day) | **Not done** — day-0 batches only (30 + 30 rounds) |
| Go `google-flights-api` (Go) | **Not tested** |
| gf-search full benchmark (40×3) | **Not done** — 3-leg spot-check only |
| CI / Vercel edge IP test | **Not done** |

---

## 1. Libraries tested

### fast-flights (primary spike)

- Python 3.14 venv: `scripts/spike-google-flights/.venv`
- Fixed extractor bug: `ResultList` is `list[Flights]`, segments in `Flights.flights[]`
- Fields available: airports, dep/arr times, `Flights.type` (often IATA marketing code), airline **names**, plane type
- **Not available:** flight number, operating carrier, codeshare status

### gf-search (secondary, Python 3.12)

```bash
python3.12 -m venv scripts/spike-google-flights/.venv312
scripts/spike-google-flights/.venv312/bin/pip install git+https://github.com/NYCU-Chung/google-flights-search.git
```

Spot-check results (`gf_search.search`):

| Leg | Results | Sample |
|-----|---------|--------|
| LHR→MAN | 5 | `BA1358` LHR→MAN, airlines `['BA']` |
| SYD→PER | 5 | `JQ988` SYD→PER, airlines `['JQ']` ← QF/JQ codeshare visible |
| LHR→JFK | 5 | Connecting options (FI, EI) with `flight_no` per segment |

**gf-search is strictly better** for flight numbers; still no separate operating-carrier block.

---

## 2. Corrected fast-flights spike (30 queries)

Fixture: `tests/schedules/fixtures/google-flights/spike-summary.json` (re-run 2026-06-20)

| Metric | Initial (buggy) | Corrected |
|--------|-----------------|-----------|
| Success with flights | 0 | **21** |
| Errors | 2 | **9** (often DOH→LHR) |
| Empty parses | 28 | **0** |

Affiliate example (`LHR→MAN`, 2026-09-15): **8 options**, **12 segments**, times populated, marketing inferred as `BA` on direct legs — **no CJ/A0 distinction**.

Trunk example (`LHR→JFK`): **29 options**, multiple marketing codes (`AA`, `AT`, `BA`, …) on connecting itineraries.

---

## 3. §4(j) affiliate test cases

| Query | GF data returned | §4(j) usable? |
|-------|------------------|---------------|
| LHR→MAN (BA affiliate) | Marketing `BA`, times OK | **No** — operating CJ/A0 not exposed |
| SYD→PER (QF/JQ) | gf-search: `JQ988`, airlines `['JQ']` | **Partial** — JQ visible (permitted exception) but not via fast-flights alone |
| DFW→ABI (AA Eagle) | Parsed on some dates | **No** — OO/MQ not distinguished |
| MAD→PMI (I2) | Parsed | **No** — I2 not distinguished from IB |

**Operating carrier ≥90% when GF shows result:** **FAIL** for true operating-carrier field (0% api-sourced; 100% inferred marketing).

---

## 4. Reliability soak (day-0, corrected extractor)

30 sequential queries, 1.2s delay:

| Metric | Value | Plan target |
|--------|-------|-------------|
| Error rate | **33%** | — |
| Empty rate | **0%** | — |
| Combined fail | **33%** | **<10%** |
| With flights | 67% | — |

Log: `tests/schedules/fixtures/google-flights/soak-log.jsonl`

Errors correlate with **DOH→LHR** and intermittent parser exceptions — not stable enough for production without retries and monitoring.

---

## 5. NormalizedFlight mapping

| Field | fast-flights | gf-search |
|-------|--------------|-----------|
| `marketingCarrier` | From `Flights.type` | From `airlines[0]` |
| `operatingCarrier` | **Inferred = marketing** | **Same as airlines** |
| `operatingCarrierSource` | `"inferred"` only | N/A |
| `departure.time` / `arrival.time` | Yes (ISO-ish) | Yes (string) |
| `flightNumber` | **No** | **Yes** (`flight_no`) |
| `codeshareStatus` | **No** | **No** |

---

## 6. Product, legal, and architecture gates

| Gate | Assessment |
|------|------------|
| Google ToS | Undocumented protocol scraping — **high risk** for server deployment |
| Zero-API default UX | Runtime calls — **conflicts** unless env-gated |
| User paste overlap | Users already copy from GF links — scraping adds ops burden |
| Architecture | Python sidecar or subprocess; not native to TS monorepo |
| Degradation | Must fall back to paste — already default |

---

## 7. Adopt / Reject / Defer

| Option | Decision |
|--------|----------|
| **Adopt** (default UX) | **No** |
| **Reject** (never revisit) | **No** — data is partially obtainable |
| **Defer** | **Yes** — optional env-gated autofill experiment using **gf-search** on Python 3.12; requires UI ground-truth audit for affiliate legs and legal review |

---

## 8. Initial spike error (documentation)

The 2026-06-19 run used `getattr(result, "flights", [])` on a `ResultList`. That attribute does not exist; the correct pattern is `for option in result: ... option.flights`. **Do not use the initial 0% success numbers** — they are invalid.

---

## 9. How to re-run

```bash
# fast-flights (Python 3.14 venv)
scripts/spike-google-flights/.venv/bin/pip install -r scripts/spike-google-flights/requirements.txt
scripts/spike-google-flights/.venv/bin/python scripts/spike-google-flights/spike.py
scripts/spike-google-flights/.venv/bin/python scripts/spike-google-flights/soak.py --rounds 50

# gf-search spot-check (Python 3.12)
scripts/spike-google-flights/.venv312/bin/python -c "from gf_search import search; print(search('SYD','PER','2026-09-15')[:2])"
```
