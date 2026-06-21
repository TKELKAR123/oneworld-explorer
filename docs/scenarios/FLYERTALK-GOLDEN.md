# FlyerTalk golden scenarios

Canonical routes derived from the [Oneworld Explorer User Guide (2008084)](https://www.flyertalk.com/forum/oneworld/2008084-oneworld-explorer-user-guide.html). Used as regression targets before FlyerTalk launch.

| ID | Theme | Route / intent | Expected |
|----|-------|----------------|----------|
| SC-001 | Classic RTW | JFK→LHR→DOH→SIN→SYD→LAX→JFK | Valid LONE4 |
| SC-023 | Implicit open jaw | JFK→…→ORD | Valid §4(c)(a) |
| SC-017 | Invalid O-D | JFK out, LHR return | Invalid |
| SC-007 | Hawaii backtrack | HNL ↔ mainland reverse | Invalid §4(b) |
| SC-004 | Extra Asia segments | 5 Asia flight segments | Invalid §4(e)(2) |
| SC-010 | Africa/EU MU/ZA | EU both directions + MU/ZA | Invalid §4(e)(3) |
| SC-051 | IONE3 market | 3-continent business, IONE3, market XX | Invalid §0 IONE3 |
| SC-081 | IONE3 US | 3-continent business, IONE3, market US | Valid |
| SC-026 | Carrier | UA on sector | Invalid §4 |
| SC-085 | Full booking | Carriers + times + ticket | Valid |
| SC-087 | US double dep | 2 US intl departures | Warning geometry; error when schedule complete |

Catalog tag: `flyertalk-golden` on scenarios above plus forum shorthand routes added in SC-091–SC-098.

## Forum shorthand (added in catalog)

| ID | Shorthand | Notes |
|----|-----------|-------|
| SC-091 | JFK-LAX-MEL-SIN-LHR-JFK | User Guide example pattern |
| SC-092 | Min 2 stopovers | Timed itinerary with only one &gt;24h gap → invalid §8 |
| SC-093 | 16-segment budget | OSL–DOH–ADL–PER–BNE–SYD–CHC–AKL–HKG–BKK–TYO–JFK–GIG–MIA–LAX–LHR–OSL style at limit |

Legacy [FAQs (338667)](https://www.flyertalk.com/forum/oneworld/338667-oneworld-explorer-ticket-faqs.html) superseded by User Guide — reference only.
