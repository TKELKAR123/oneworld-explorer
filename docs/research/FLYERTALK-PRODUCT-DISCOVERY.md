# FlyerTalk product discovery (June 2026)

Research from FlyerTalk oneworld forum threads, especially the canonical [Oneworld Explorer User Guide (2008084)](https://www.flyertalk.com/forum/oneworld/2008084-oneworld-explorer-user-guide.html), [xONEx tool bugs (913287)](https://www.flyertalk.com/forum/oneworld/913287-xonex-online-tool-bugs-thread.html), and related AFF cross-posts.

## First principle: what FlyerTalk RTW planners are actually buying

They are **not** buying flight search. They are buying **confidence before the phone call**:

1. **Structural validity** under Rule 3015 (Feb 2026 PDF), not under `rtw.oneworld.com`
2. **Segment and continent accounting** they can paste into a forum post or read to an AA RTW agent
3. **A checklist** that separates geometry (always checkable) from inventory/pricing (airline-only)

Typical workflow today: GCMap / FlightConnections → broken official tool → ExpertFlyer → 12+ hours on AA desk → pricing shock at ticket. **No step validates rules honestly.**

## Top 10 forum pain points → product opportunities

| # | Pain | Forum signal | First-principle experience |
|---|------|--------------|----------------------------|
| 1 | Official tool broken / false errors | [913287](https://www.flyertalk.com/forum/oneworld/913287-xonex-online-tool-bugs-thread.html) | **“Rule-correct even when oneworld.com disagrees”** badge + cite PDF § |
| 2 | Segment counter lies | User Guide: tool counts cities not segments | **Live segment ledger**: total 14/16, Asia 4/4, intercontinental listed separately |
| 3 | Continent surprises (“wheels touch”) | [890454](https://www.flyertalk.com/forum/oneworld/890454-if-rtw-you-transit-continent-does-count-visit.html) | **Continent charge explainer**: which legs charged which continent and why |
| 4 | Open jaw vs surface confusion | [827913](https://www.flyertalk.com/forum/oneworld/827913-does-open-jaw-asia-count-against-segment-maximum.html) | **O–D open jaw wizard** (OSL→TOS) vs mid-itinerary ARUNK warnings |
| 5 | Coterminal waste (LGA–JFK, LHR–LGW) | User Guide Ticket Tricks | **Coterminal alert** + “route via same airport to save a segment” |
| 6 | Stopover vs transit (24h) | FAQs + UK APD threads | **Per-connection classification** once times pasted; min 2 stopovers check |
| 7 | Availability ≠ route exists | [2152207](https://www.flyertalk.com/forum/oneworld/2152207-aa-rtw-desk-availability-compared-expertflyer-ow-online-booking-tool.html) | **Never imply A/D seats**; link ExpertFlyer + “call AA RTW desk” CTA |
| 8 | YQ / tax sticker shock | [2107664](https://www.flyertalk.com/forum/oneworld/2107664-carrier-imposed-fees-done4-ex-osl.html) | **Do not quote price**; optional carrier-mix surcharge *education* only |
| 9 | Agent roulette / HUCA | QF change-fee threads | **Agent script export**: flight numbers, transits marked `x`, segment list |
| 10 | Abandoned validators (2008–2010) | [350078](https://www.flyertalk.com/forum/oneworld/350078-oneworld-explorer-itinerary-validator.html) | **Maintained open-source validator** tied to current Rule 3015 |

## Five experiences that would make this genuinely useful on FlyerTalk

### 1. “Post this on FT” export (highest ROI)

One-click copy:

```
DONE4 · valid (geometry) · 14/16 segments
JFK-LHR(x)-DXB-SIN-SYD-LAX-JFK
Asia 3/4 · NA 2/6 · Atlantic JFK-LHR · Pacific SYD-LAX
Carriers: BA, EK, SQ, QF, AA (paste)
Open jaw: implicit JFK origin (§4c-a) — no ARUNK needed
```

Forum experts reject vague city lists; this replaces manual shorthand.

### 2. Segment budget dashboard (not just pass/fail)

Show **ledger**, not only errors:

- Intercontinental flights (don’t eat continent budget)
- Per-continent flight segments used
- Surfaces / ARUNK counted
- Origin open jaw (implicit) called out as **not a leg**

This directly answers the #1 “Asia 5th segment” and “8 not 7” threads.

### 3. “Building vs ready to ticket” modes

While drafting: suppress ocean/continent panic; show **guidance** (“finish via North America before Europe–Africa combo”).

When return set + 3+ continents: full Rule 3015 audit.

Matches how FT users iterate — they don’t want blocking failures on NRT→TOS mid-sketch.

### 4. Return / open-jaw assistant (Norway cluster)

Your OSL→TOS feedback maps to a huge FT cluster ([2133996](https://www.flyertalk.com/forum/oneworld/2133996-cheapest-place-europe-one-world-explorer-fares.html)):

- Start OSL, finish anywhere in Norway
- **Do not replace origin** when picking TOS
- Positioning hint: “You’ll need your own transport TOS→OSL”

### 5. Honest network layer (hybrid ADS-B + overrides)

Replace “Direct oneworld flights” with:

- **Observed recently** (ADS-B quarter)
- **Historical index only — verify timetable**
- **No recent nonstop observed** (NRT–JFK)

Links to Google Flights + FlightConnections per leg. Never claim inventory.

## What competitors do / don’t do

| Tool | FT verdict |
|------|------------|
| `rtw.oneworld.com` | Used despite hatred; false ±; bad segment math |
| Star RTW planner | “More intuitive” UX — **not** our fight |
| ExpertFlyer / KVS | Schedules/classes; no structural ONE rules |
| GCMap / FlightConnections | Maps only |
| Legacy JS validators | Dead since ~2010 |

**White space:** maintained, explainable Rule 3015 validator with FT-grade export — not booking, not ExpertFlyer.

## Explicit non-goals (forum agrees)

- Booking / payment
- Live A/D availability or RTW inventory bucket
- All-in fare quotes or YQ engine
- Post-ticketing change desk
- Award/miles RTW (different product)

## Launch wedge for User Guide thread

Post as: *open-source Rule 3015 checker for cases the official tool gets wrong* — demo SC-023 implicit open jaw, SC-004 Asia limit, SC-010 Africa/EU, SC-051 IONE3.

Ask for edge cases **with segment lists and carriers**, not “is Tokyo nice?”

## Mapping to existing roadmap

| FlyerTalk need | Current / planned work |
|----------------|------------------------|
| Segment ledger | `SegmentBudgets` + TripSummaryStrip (wire) |
| FT export | New — high priority |
| Building mode | Planned validationPhase |
| Return slot OSL→TOS | Planned pickReturn fix |
| Honest routes | Planned ADS-B hybrid index |
| Globe chain building | Planned — replaces FlightConnections for *structure* only |
| Agent script | New — extends export |
