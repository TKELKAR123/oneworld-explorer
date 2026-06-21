from datetime import datetime, timezone


def format_datetime(dt) -> str:
    """Convert fast_flights SimpleDatetime to ISO-ish string."""
    if dt is None:
        return ""
    date = getattr(dt, "date", None) or []
    time = getattr(dt, "time", None) or []
    if len(date) >= 3 and len(time) >= 2:
        return f"{date[0]:04d}-{date[1]:02d}-{date[2]:02d}T{time[0]:02d}:{time[1]:02d}:00"
    return str(dt)


def normalize_segment(seg: dict, provider: str) -> dict:
    marketing = seg.get("marketing_carrier") or seg.get("airline") or ""
    operating = seg.get("operating_carrier") or marketing
    dep_time = seg.get("departure") or ""
    arr_time = seg.get("arrival") or ""
    from_pt = seg.get("from") or ""
    to_pt = seg.get("to") or ""
    flight_no = seg.get("flight_number") or seg.get("flight_no") or ""

    return {
        "marketingCarrier": str(marketing).upper()[:3],
        "operatingCarrier": str(operating).upper()[:3],
        "operatingCarrierSource": "inferred",
        "flightNumber": str(flight_no),
        "departure": {"point": str(from_pt).upper(), "time": str(dep_time)},
        "arrival": {"point": str(to_pt).upper(), "time": str(arr_time)},
        "stops": [],
        "provider": provider,
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }


def extract_from_fast_flights(result, query_id: str, date: str) -> tuple[list[dict], int]:
    """ResultList is a list[Flights] — not result.flights."""
    out: list[dict] = []
    options = list(result) if result is not None else []

    for opt in options:
        marketing = getattr(opt, "type", "") or ""
        if marketing == "multi":
            airline_names = getattr(opt, "airlines", []) or []
            marketing = airline_names[0][:2].upper() if airline_names else ""

        segments = getattr(opt, "flights", None) or []
        for seg in segments:
            from_ap = getattr(seg, "from_airport", None)
            to_ap = getattr(seg, "to_airport", None)
            raw = {
                "marketing_carrier": str(marketing).upper()[:3],
                "operating_carrier": str(marketing).upper()[:3],
                "flight_number": "",
                "from": getattr(from_ap, "code", "") if from_ap else "",
                "to": getattr(to_ap, "code", "") if to_ap else "",
                "departure": format_datetime(getattr(seg, "departure", None)),
                "arrival": format_datetime(getattr(seg, "arrival", None)),
                "plane_type": getattr(seg, "plane_type", ""),
            }
            norm = normalize_segment(raw, "fast-flights")
            norm["operatingCarrierSource"] = "inferred"
            norm["_queryId"] = query_id
            norm["_date"] = date
            norm["_airlineNames"] = getattr(opt, "airlines", [])
            out.append(norm)

    return out, len(options)
