#!/usr/bin/env python3
"""
Reliability soak for Google Flights spike (Method B day-0 batch).
Runs N sequential queries and records error/empty/CAPTCHA-like failures.

Full 7-day soak: re-run via cron or GitHub Action daily; append to soak-log.jsonl.

Usage:
  scripts/spike-google-flights/.venv/bin/python scripts/spike-google-flights/soak.py [--rounds 50]
"""
from __future__ import annotations

import argparse
import json
import random
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FIXTURE_DIR = ROOT / "tests" / "schedules" / "fixtures" / "google-flights"
LOG_PATH = FIXTURE_DIR / "soak-log.jsonl"

# Rotate through trunk + affiliate ODs
SOAK_LEGS = [
    ("LHR", "JFK"),
    ("SYD", "LAX"),
    ("DOH", "LHR"),
    ("LHR", "MAN"),
    ("SYD", "PER"),
    ("DFW", "ABI"),
    ("MAD", "PMI"),
    ("BNE", "OOL"),
]
SOAK_DATES = ["2026-08-01", "2026-09-15", "2026-10-20", "2026-11-10", "2026-12-05"]


def run_query(from_iata: str, to_iata: str, date: str) -> dict:
    import importlib.util

    spike_path = Path(__file__).parent / "spike.py"
    spec = importlib.util.spec_from_file_location("gf_spike", spike_path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    started = time.monotonic()
    resp = mod.run_fast_flights_query(from_iata, to_iata, date)
    elapsed_ms = int((time.monotonic() - started) * 1000)
    flights = resp.get("flights") or []
    err_text = (resp.get("error") or "").lower()
    blocked = any(
        x in err_text
        for x in ("captcha", "429", "403", "blocked", "abuse", "unauthorized", "forbidden")
    )
    return {
        "at": datetime.now(timezone.utc).isoformat(),
        "from": from_iata,
        "to": to_iata,
        "date": date,
        "ok": resp.get("ok", False),
        "flightCount": len(flights),
        "empty": resp.get("ok") and len(flights) == 0,
        "error": resp.get("error"),
        "blocked": blocked,
        "elapsedMs": elapsed_ms,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--rounds", type=int, default=50)
    parser.add_argument("--delay-ms", type=int, default=1500)
    args = parser.parse_args()

    FIXTURE_DIR.mkdir(parents=True, exist_ok=True)
    results: list[dict] = []

    print(f"Soak: {args.rounds} sequential queries, {args.delay_ms}ms delay")
    for i in range(args.rounds):
        leg = random.choice(SOAK_LEGS)
        date = random.choice(SOAK_DATES)
        row = run_query(leg[0], leg[1], date)
        row["round"] = i + 1
        results.append(row)
        status = "ok" if row["ok"] and row["flightCount"] > 0 else ("empty" if row["empty"] else "fail")
        print(f"  [{i+1}/{args.rounds}] {leg[0]}→{leg[1]} {date}: {status} ({row['elapsedMs']}ms)")
        with LOG_PATH.open("a") as f:
            f.write(json.dumps(row) + "\n")
        if i < args.rounds - 1:
            time.sleep(args.delay_ms / 1000)

    errors = sum(1 for r in results if not r["ok"])
    empty = sum(1 for r in results if r["empty"])
    blocked = sum(1 for r in results if r.get("blocked"))
    with_flights = sum(1 for r in results if r["flightCount"] > 0)

    batch = {
        "batchAt": datetime.now(timezone.utc).isoformat(),
        "rounds": args.rounds,
        "errors": errors,
        "empty": empty,
        "blocked": blocked,
        "withFlights": with_flights,
        "errorRate": round(errors / args.rounds, 3),
        "emptyRate": round(empty / args.rounds, 3),
        "passesPlanThreshold": (errors + empty) / args.rounds < 0.10,
    }
    batch_path = FIXTURE_DIR / "soak-batch-latest.json"
    batch_path.write_text(json.dumps(batch, indent=2) + "\n")
    print(f"\nBatch: errorRate={batch['errorRate']}, emptyRate={batch['emptyRate']}, blocked={blocked}")
    print(f"Plan pass (<10% error+empty): {batch['passesPlanThreshold']}")
    print(f"Wrote {batch_path} (append log: {LOG_PATH})")


if __name__ == "__main__":
    main()
