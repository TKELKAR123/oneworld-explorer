# Traffic Conferences (TC) vs Explorer Continents

Version: `2026-02-27` (aligned with `oneworld_Explorer_27_FEB_26.pdf` and [PREDICATES.md](../rules/PREDICATES.md))

This document explains how **IATA Traffic Conferences (TC1/TC2/TC3)** relate to the six **Explorer pricing continents** used in Rule 3015. They are related but not identical: TC zones govern directional and inter-zone crossing rules; Explorer continents govern segment allowances, continent counting, and fare basis selection.

## Quick reference

| Traffic zone | Explorer continents | Typical crossing |
|--------------|---------------------|------------------|
| **TC1** | North America, South America | Atlantic ↔ TC2; Pacific ↔ TC3 |
| **TC2** | Europe / Middle East, Africa | Atlantic ↔ TC1; overland/short-haul to TC3 at margins |
| **TC3** | Asia, South West Pacific | Pacific ↔ TC1; overland/short-haul to TC2 at margins |

```
TC1 = { north-america, south-america }
TC2 = { europe-middle-east, africa }
TC3 = { south-west-pacific, asia }
```

Implementation mirror: [`CONTINENT_ZONE`](../../packages/core/src/rules/constants.ts).

## Formal sources (hierarchy)

| Priority | Document | Role |
|----------|----------|------|
| 1 | [oneworld Rule 3015 PDF](https://assets.ctfassets.net/m9ph4qvas97u/58dSxVDQ0kjLFD2Dsxpo6m/0ae0e100a274267777529778cbe91473/oneworld_Explorer_27_FEB_26.pdf) | Tariff authority: six continents, TC mapping, routing rules, **named country exceptions only** |
| 2 | [Qantas oneworld Explorer Continent Definitions Guide](https://www.qantas.com/content/dam/qac/oneworld-clue-cards/ow-rtw-continents.pdf) | Agent-facing **full country → continent tables** (especially Asia vs SWP) |
| 3 | [IATA Provisions for Traffic Conferences](https://www.iata.org/contentassets/01e197ea66384f27a9e763d151ae2d7d/provisions-traffic-conferences.pdf) | TC1/TC2/TC3 base geography; does **not** define Explorer’s six pricing continents |
| 4 | IATA PAT / CCD (paid) | Sub-area codes for bulk country inference |

Rule 3015 does not publish an exhaustive ISO list. Where the PDF is silent, use the Qantas continent guide for country assignments and IATA TC data for traffic zones.

## Explorer continents (pricing units)

Explorer fares count **continents visited**, not TC zones. There are exactly six:

| Continent key | Label | Free flight segments (typical) |
|---------------|-------|--------------------------------|
| `europe-middle-east` | Europe / Middle East | 4 |
| `africa` | Africa | 4 |
| `asia` | Asia | 4 |
| `south-west-pacific` | South West Pacific | 4 |
| `north-america` | North America | 6 |
| `south-america` | South America | 4 |

A single TC zone can contain **two** Explorer continents (TC1 and TC2 each span two; TC3 spans two). Visiting both North America and South America counts as **two continents** even though both are TC1.

## Europe / Middle East sub-zones

Within the combined `europe-middle-east` continent, the PDF distinguishes two **sub-zones** (used for some directional and origin rules):

| Sub-zone | Meaning |
|----------|---------|
| `europe` | Geographic Europe plus PDF exceptions **DZ**, **MA**, **TN**, and **RU** (see notes in [COUNTRY-MAP.json](./COUNTRY-MAP.json)) |
| `middle-east` | Middle East and North African exceptions **EG**, **LY**, **SD**, plus the Gulf, Levant, Iran, Turkey, etc. |

Sub-zones apply **only** when `explorerContinent` is `europe-middle-east`. All other continents use `explorerSubZone: null`.

## PDF-driven country exceptions

These ISO assignments override naive geographic or UN regional grouping. Full per-country data lives in [COUNTRY-MAP.json](./COUNTRY-MAP.json).

### Pulled into Europe sub-zone (not Africa)

| ISO | Country | Why |
|-----|---------|-----|
| DZ | Algeria | PDF lists with Europe/ME, not Africa |
| MA | Morocco | PDF lists with Europe/ME, not Africa |
| TN | Tunisia | PDF lists with Europe/ME, not Africa |
| RU | Russia | PDF lists under Europe/ME; transcontinental — western hubs treated as Europe (see country note) |

### Pulled into Middle East sub-zone (not Africa)

| ISO | Country | Why |
|-----|---------|-----|
| EG | Egypt | PDF Middle East, not Africa |
| LY | Libya | PDF Middle East, not Africa |
| SD | Sudan | PDF Middle East, not Africa |

### Explicitly Asia (Central Asia)

| ISO | Countries |
|-----|-----------|
| KZ, KG, TJ, TM, UZ | Kazakhstan, Kyrgyzstan, Tajikistan, Turkmenistan, Uzbekistan — PDF names these under Asia |

### Americas split

| ISO | Continent | Why |
|-----|-----------|-----|
| PA | North America | PDF: Panama with NA/Caribbean/Central America |
| CO, EC, … | South America | Remainder of South America minus Panama |

North America also includes **US, CA, MX**, Central America, and the Caribbean (see map).

## Asia vs South West Pacific

The PDF groups **Asia** and **South West Pacific** under TC3 but prices them as separate Explorer continents. The authoritative country split is in the [Qantas Continent Definitions Guide](https://www.qantas.com/content/dam/qac/oneworld-clue-cards/ow-rtw-continents.pdf), transcribed into [COUNTRY-MAP.json](./COUNTRY-MAP.json) on 2026-06-15.

| Region | Explorer continent | Examples |
|--------|-------------------|----------|
| Maritime Southeast Asia & mainland Asia | `asia` | ID, MY, SG, TH, PH, IN, JP, CN, GU, MH, FM, MP, PW, … |
| Australia, New Zealand, Pacific islands | `south-west-pacific` | AU, NZ, FJ, PG, NC, PF, … |

**Indonesia (ID) is Asia**, not South West Pacific. The Qantas guide also places the **Micronesia bloc** (Guam, Marshall Islands, Micronesia, Northern Mariana Islands, Palau) under **Asia**, not South West Pacific.

## TC zones and directional rules

TC zones define the **eastbound order** used for global direction and Atlantic/Pacific crossing detection:

```
Eastbound order: TC1 → TC2 → TC3 → TC1 …
```

| Predicate | Definition (zone-level) |
|-----------|---------------------------|
| `crossesAtlantic` | TC1 ↔ TC2 |
| `crossesPacific` | TC1 ↔ TC3 |
| `isInterTC` | `tc(from) ≠ tc(to)` |

Continent-level analysis (16-segment cap, per-continent free segments, 3–6 continent fare basis) uses **Explorer continents**, not TC alone. A TC1-internal trip from New York to Buenos Aires crosses no ocean in TC terms but visits **two continents**.

## Source legend (country map)

Each entry in [COUNTRY-MAP.json](./COUNTRY-MAP.json) tracks **multiple sources** rather than a single `source` tag. The canonical `explorerContinent` is the resolved value; provenance lives under `sources`.

### Schema (per country)

```json
{
  "iso": "GU",
  "explorerContinent": "asia",
  "explorerSubZone": null,
  "trafficZone": "TC3",
  "sources": {
    "iata": { "trafficZone": "TC3" },
    "qantasGuide": {
      "explorerContinent": "asia",
      "regionLabel": "Asia",
      "guideUrl": "https://www.qantas.com/content/dam/qac/oneworld-clue-cards/ow-rtw-continents.pdf",
      "guideVersion": "undated",
      "transcribedAt": "2026-06-15"
    }
  },
  "resolvedFrom": "qantasGuide",
  "conflicts": [
    {
      "field": "explorerContinent",
      "values": { "priorInference": "south-west-pacific", "qantasGuide": "asia" },
      "note": "Prior community inference superseded by Qantas agent guide."
    }
  ],
  "notes": "Qantas guide lists under Asia (not South West Pacific); Micronesia bloc treated as Asia."
}
```

| Field | Role |
|-------|------|
| `explorerContinent` | Resolved Explorer pricing continent (canonical) |
| `explorerSubZone` | `europe` or `middle-east` when `explorerContinent` is `europe-middle-east`; otherwise `null` |
| `trafficZone` | IATA TC1 / TC2 / TC3 |
| `sources.rule3015` | Named exceptions from Rule 3015 / Explorer PDF |
| `sources.qantasGuide` | Qantas `ow-rtw-continents.pdf` row (region label, guide URL, transcription date) |
| `sources.iata` | IATA TC traffic-zone inference |
| `resolvedFrom` | Which source won for `explorerContinent`: `rule3015` → `qantasGuide` → `iata` → `geography` |
| `conflicts` | Present when sources disagree on continent (audit trail; rule3015 wins) |
| `notes` | Human-readable edge cases |

### Resolution hierarchy

1. **`rule3015`** — PDF named exceptions (DZ, MA, TN, EG, LY, SD, RU, Central Asia, PA, …)
2. **`qantasGuide`** — Full country tables from Qantas agent continent guide (transcribed 2026-06-15)
3. **`iata`** — Standard IATA TC geography where Qantas is silent
4. **`geography`** — Common-sense fallback for ISO codes absent from all formal sources (e.g. AQ, XK, micro-territories)

### `sources` keys

| Key | Meaning |
|-----|---------|
| `rule3015` | Named or clearly implied in Rule 3015 / Explorer PDF text |
| `qantasGuide` | Qantas `ow-rtw-continents.pdf` country → region table |
| `iata` | IATA Traffic Conference zone (`trafficZone` only; continent inferred when needed) |

Qantas guide version is **undated** in the PDF; we record `transcribedAt: 2026-06-15` from agent-portal screenshots.

### Countries absent from Qantas guide (35 ISO codes)

The Qantas table covers ~215 sovereign states and major territories. The remaining **35** entries in our map are ISO completeness / edge territories resolved via `iata` or `geography`: Andorra (AD), Antarctica (AQ), Åland (AX), Caribbean/British micro-territories (BL, MF, PM, …), Australian outlying islands (CC, CX, HM, NF), Kosovo (XK), North Korea (KP), Palestine (PS), South Sudan (SS), Tokelau (TK), US Minor Outlying Islands (UM), Vatican (VA), and similar. See per-entry `notes` in the map.

**Derived from Qantas parentheticals:** Puerto Rico (PR) inherits North America from the USA row; Aruba (AW) and dissolved Netherlands Antilles codes (BQ, CW, SX) inherit North America.

## Using this data

1. **Country → continent**: lookup ISO in [COUNTRY-MAP.json](./COUNTRY-MAP.json).
2. **Continent → TC**: fixed mapping in `CONTINENT_ZONE` (each continent maps to exactly one TC).
3. **Airport → country → continent**: airports inherit country mapping; airport-specific edge cases (e.g. Russian cities east of Urals) may need future overrides in airport data, not in this country table.

## Related files

- [COUNTRY-MAP.json](./COUNTRY-MAP.json) — 250 ISO 3166-1 alpha-2 entries (including XK, AQ)
- [PREDICATES.md](../rules/PREDICATES.md) — formal ontology (`continentOf`, `tcOf`, `subZoneOf`)
- [Qantas Continent Definitions Guide](https://www.qantas.com/content/dam/qac/oneworld-clue-cards/ow-rtw-continents.pdf) — operational country tables
- [packages/core/src/rules/constants.ts](../../packages/core/src/rules/constants.ts) — runtime TC ↔ continent constants
