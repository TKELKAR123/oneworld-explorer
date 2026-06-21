#!/usr/bin/env python3
"""
Spike Google Flights protocol libraries (Method B).
Maps results to OneworldExplorer NormalizedFlight shape and writes fixtures.

Usage (from repo root):
  python3 -m venv scripts/spike-google-flights/.venv
  scripts/spike-google-flights/.venv/bin/pip install -r scripts/spike-google-flights/requirements.txt
  scripts/spike-google-flights/.venv/bin/python scripts/spike-google-flights/spike.py
"""
from __future__ import annotations

import json
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FIXTURE_DIR = ROOT / "tests" / "schedules" / "fixtures" / "google-flights"
CORPUS_PATH = ROOT / "data" / "fixtures" / "route-benchmark-corpus.json"

# Affiliate + trunk queries — 3 dates per leg (peak / shoulder / off)
DATES = ["2026-07-15", "2026-09-15", "2026-11-15"]

SPIKE_QUERIES = [
    {"id": "affiliate-ba-lhr-man", "from": "LHR", "to": "MAN", "category": "affiliate-edge"},
    {"id": "affiliate-ba-lhr-edi", "from": "LHR", "to": "EDI", "category": "affiliate-edge"},
    {"id": "affiliate-qf-syd-per", "from": "SYD", "to": "PER", "category": "affiliate-edge"},
    {"id": "affiliate-qf-bne-ool", "from": "BNE", "to": "OOL", "category": "affiliate-edge"},
    {"id": "affiliate-aa-dfw-abi", "from": "DFW", "to": "ABI", "category": "affiliate-edge"},
    {"id": "affiliate-ib-mad-pmi", "from": "MAD", "to": "PMI", "category": "affiliate-edge"},
    {"id": "affiliate-as-sea-pdx", "from": "SEA", "to": "PDX", "category": "affiliate-edge"},
    {"id": "trunk-ba-lhr-jfk", "from": "LHR", "to": "JFK", "category": "high-traffic-trunk"},
    {"id": "trunk-qf-syd-lax", "from": "SYD", "to": "LAX", "category": "high-traffic-trunk"},
    {"id": "trunk-qr-doh-lhr", "from": "DOH", "to": "LHR", "category": "high-traffic-trunk"},
]


def normalize_segment(seg: dict, provider: str) -> dict:
    """Map library segment to packages/schedules/src/provider.ts NormalizedFlight."""
    marketing = (
        seg.get("marketing_carrier")
        or seg.get("marketingCarrier")
        or seg.get("airline")
        or seg.get("carrier")
        or ""
    )
    operating = (
        seg.get("operating_carrier")
        or seg.get("operatingCarrier")
        or seg.get("operating")
        or marketing
    )
    if isinstance(operating, dict):
        operating = operating.get("code") or operating.get("iata") or marketing
    if isinstance(marketing, dict):
        marketing = marketing.get("code") or marketing.get("iata") or ""

    dep_time = seg.get("departure") or seg.get("departure_time") or seg.get("departureTime") or ""
    arr_time = seg.get("arrival") or seg.get("arrival_time") or seg.get("arrivalTime") or ""
    if isinstance(dep_time, dict):
        dep_time = dep_time.get("time") or dep_time.get("utc") or ""
    if isinstance(arr_time, dict):
        arr_time = arr_time.get("time") or arr_time.get("utc") or ""

    from_pt = seg.get("from") or seg.get("origin") or seg.get("departure_airport") or ""
    to_pt = seg.get("to") or seg.get("destination") or seg.get("arrival_airport") or ""
    if isinstance(from_pt, dict):
        from_pt = from_pt.get("iata") or from_pt.get("code") or ""
    if isinstance(to_pt, dict):
        to_pt = to_pt.get("iata") or to_pt.get("code") or ""

    flight_no = seg.get("flight_number") or seg.get("flightNumber") or seg.get("flight_no") or ""

    return {
        "marketingCarrier": str(marketing).upper()[:2] if marketing else "",
        "operatingCarrier": str(operating).upper()[:3] if operating else "",
        "operatingCarrierSource": "api" if operating and operating != marketing else "inferred",
        "flightNumber": str(flight_no),
        "departure": {"point": str(from_pt).upper(), "time": str(dep_time)},
        "arrival": {"point": str(to_pt).upper(), "time": str(arr_time)},
        "stops": [],
        "provider": provider,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }


from extract import extract_from_fast_flights
def run_fast_flights_query(from_iata: str, to_iata: str, date: str) -> dict:
    html_meta: dict = {}
    try:
        from fast_flights import FlightQuery, Passengers, create_query, fetch_flights_html, get_flights
    except ImportError as e:
        return {"ok": False, "error": f"fast-flights import failed: {e}", "flights": []}

    try:
        query = create_query(
            flights=[FlightQuery(date=date, from_airport=from_iata, to_airport=to_iata)],
            trip="one-way",
            passengers=Passengers(adults=1),
            seat="business",
        )
        html = fetch_flights_html(query)
        html_lower = html.lower()
        html_meta = {
            "htmlLength": len(html),
            "captchaHint": "captcha" in html_lower or "unusual traffic" in html_lower,
            "hasAfInit": "AF_init" in html or "data-flights" in html,
        }
        result = get_flights(query)
        flights, option_count = extract_from_fast_flights(result, query_id="", date=date)
        return {
            "ok": True,
            "flights": flights,
            "optionCount": option_count,
            "rawType": type(result).__name__,
            "htmlMeta": html_meta,
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "flights": [],
            "htmlMeta": html_meta,
        }


def score_normalized(flights: list[dict]) -> dict:
    if not flights:
        return {
            "count": 0,
            "hasOperatingCarrier": False,
            "hasTimes": False,
            "hasFlightNumber": False,
            "operatingDistinct": [],
        }
    ops = {f.get("operatingCarrier") for f in flights if f.get("operatingCarrier")}
    return {
        "count": len(flights),
        "hasOperatingCarrier": any(f.get("operatingCarrier") for f in flights),
        "hasTimes": any(f.get("departure", {}).get("time") for f in flights),
        "hasFlightNumber": any(f.get("flightNumber") for f in flights),
        "operatingDistinct": sorted(ops),
    }


def main() -> int:
    FIXTURE_DIR.mkdir(parents=True, exist_ok=True)
    results: list[dict] = []
    errors = 0
    empty = 0
    total_queries = 0

    print("Google Flights spike (fast-flights)")
    for q in SPIKE_QUERIES:
        for date in DATES:
            total_queries += 1
            print(f"  {q['id']} {q['from']}→{q['to']} @ {date}...", end=" ", flush=True)
            resp = run_fast_flights_query(q["from"], q["to"], date)
            flights = resp.get("flights") or []
            score = score_normalized(flights)
            row = {
                "queryId": q["id"],
                "category": q["category"],
                "from": q["from"],
                "to": q["to"],
                "date": date,
                "ok": resp.get("ok", False),
                "error": resp.get("error"),
                "optionCount": resp.get("optionCount", 0),
                "htmlMeta": resp.get("htmlMeta"),
                "score": score,
                "flights": flights[:5],
            }
            results.append(row)
            if not resp.get("ok"):
                errors += 1
                print("ERR")
            elif score["count"] == 0:
                empty += 1
                opts = resp.get("optionCount", 0)
                print(f"empty (options={opts})")
            else:
                print(f"{score['count']} flights, ops={score['operatingDistinct'][:3]}")

            fixture_name = f"{q['id']}-{date}.json"
            (FIXTURE_DIR / fixture_name).write_text(json.dumps(row, indent=2) + "\n")

    summary = {
        "spikedAt": datetime.now(timezone.utc).isoformat(),
        "library": "fast-flights",
        "totalQueries": total_queries,
        "errors": errors,
        "emptyResults": empty,
        "successWithFlights": total_queries - errors - empty,
        "errorRate": round(errors / total_queries, 3) if total_queries else 0,
        "emptyRate": round(empty / total_queries, 3) if total_queries else 0,
        "affiliateQueries": [r for r in results if r["category"] == "affiliate-edge"],
        "trunkQueries": [r for r in results if r["category"] == "high-traffic-trunk"],
    }
    summary_path = FIXTURE_DIR / "spike-summary.json"
    summary_path.write_text(json.dumps(summary, indent=2) + "\n")
    print(f"\nSummary: {total_queries} queries, {errors} errors, {empty} empty, {summary['successWithFlights']} with flights")
    print(f"Wrote {summary_path}")
    return 0 if errors < total_queries else 1


if __name__ == "__main__":
    sys.exit(main())
