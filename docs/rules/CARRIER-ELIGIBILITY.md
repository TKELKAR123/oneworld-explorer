# Carrier Eligibility — Rule 3015 §4

Eligible Explorer marketing carriers (Feb 2026 PDF §4 intro):

`AA, AS, AT, AY, BA, CX, FJ, IB, JL, MH, NU, QF, QR, RJ, UL, WY`

## Codeshare (§4(j))

- Default: codeshare only between eligible marketing and eligible operating carriers
- Exceptions: QF marketed / JQ operated; QF marketed / QQ operated
- All other codeshares: **not permitted**

## Affiliates (page 4)

Regional subsidiaries listed in [`data/CARRIER-REGISTRY.json`](../../data/CARRIER-REGISTRY.json) may operate when parent is eligible.

## Ground transport

BA/QF ground transport services are not part of Explorer (§4).

## v0.1 vs v0.2

| Rule | v0.1 | v0.2 |
|------|------|------|
| §4 intro | warn if carrier tagged | enforce from schedule |
| §4(j) affiliates | document | enforce |
| §15 Cuba + AA/AS | warn | enforce |

See [CARRIER-ONTOLOGY-DEBATES.md](./CARRIER-ONTOLOGY-DEBATES.md).
