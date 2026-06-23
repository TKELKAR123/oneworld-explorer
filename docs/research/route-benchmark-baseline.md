# Route index benchmark

Generated: 2026-06-22

Corpus: `data/fixtures/route-benchmark-corpus.json` (60 entries)

## Scorecard

| Metric | Value | Target (Method A) |
|--------|-------|-------------------|
| Recall (should-appear) | 92.6% | ≥95% |
| False-active rate (must-not-appear) | 0.0% | ≤2% |
| Precision proxy | 100.0% | — |

## Summary by category

- **known-inactive**: 10 entries — pass 4, fail 0, warn 6, na 0
- **known-seasonal**: 10 entries — pass 6, fail 0, warn 4, na 0
- **high-traffic-trunk**: 10 entries — pass 10, fail 0, warn 0, na 0
- **affiliate-edge**: 10 entries — pass 0, fail 0, warn 0, na 10
- **newer-members**: 10 entries — pass 8, fail 2, warn 0, na 0
- **false-negative-trap**: 10 entries — pass 1, fail 0, warn 0, na 9

## Detail

| ID | Cat | Route | Expected | OF | Merged | Verdict | Detail |
|----|-----|-------|----------|----|----|---------|--------|
| inactive-aa-nrt-jfk | known-inactive | AA NRT→JFK | must-not-appear-active | N | N | pass | Correctly blocked by inactive override |
| inactive-jl-nrt-jfk | known-inactive | JL NRT→JFK | must-not-appear-active | N | N | pass | Correctly blocked by inactive override |
| inactive-aa-jfk-nrt | known-inactive | AA JFK→NRT | must-not-appear-active | N | N | pass | Correctly blocked by inactive override |
| inactive-jl-jfk-nrt | known-inactive | JL JFK→NRT | must-not-appear-active | N | N | pass | Correctly blocked by inactive override |
| inactive-aa-dfw-nrt | known-inactive | AA DFW→NRT | verify-dates | Y | Y | warn | Present in stale index — may be false positive |
| inactive-ba-lhr-per | known-inactive | BA LHR→PER | verify-dates | N | N | warn | Absent — inconclusive for seasonal |
| inactive-qf-per-lhr | known-inactive | QF PER→LHR | verify-dates | Y | Y | warn | Present in stale index — may be false positive |
| inactive-mh-kul-lhr | known-inactive | MH KUL→LHR | verify-dates | Y | Y | warn | Present in stale index — may be false positive |
| inactive-ib-mad-bos | known-inactive | IB MAD→BOS | verify-dates | Y | Y | warn | Present in stale index — may be false positive |
| inactive-rj-amm-jfk | known-inactive | RJ AMM→JFK | verify-dates | Y | Y | warn | Present in stale index — may be false positive |
| seasonal-ib-jfk-mad | known-seasonal | IB JFK→MAD | may-appear-verify-dates | Y | Y | warn | Present — seasonal; verify dates |
| seasonal-ay-mad-osl | known-seasonal | AY MAD→OSL | may-appear-verify-dates | N | Y | warn | Present — seasonal; verify dates |
| seasonal-ba-jfk-lhr | known-seasonal | BA JFK→LHR | should-appear | Y | Y | pass | Present in merged index |
| seasonal-ay-lhr-osl | known-seasonal | AY LHR→OSL | may-appear-verify-dates | N | Y | warn | Present — seasonal; verify dates |
| seasonal-ay-hel-bkk | known-seasonal | AY HEL→BKK | may-appear-verify-dates | Y | Y | warn | Present — seasonal; verify dates |
| seasonal-fj-nan-akl | known-seasonal | FJ NAN→AKL | should-appear | Y | Y | pass | Present in merged index |
| seasonal-cx-hkg-lhr | known-seasonal | CX HKG→LHR | should-appear | Y | Y | pass | Present in merged index |
| seasonal-jl-hnd-sfo | known-seasonal | JL HND→SFO | should-appear | Y | Y | pass | Present in merged index |
| seasonal-qr-doh-mle | known-seasonal | QR DOH→MLE | should-appear | Y | Y | pass | Present in merged index |
| seasonal-as-sea-lhr | known-seasonal | BA SEA→LHR | should-appear | Y | Y | pass | Present in merged index |
| trunk-ba-lhr-jfk | high-traffic-trunk | BA LHR→JFK | should-appear | Y | Y | pass | Present in merged index |
| trunk-aa-jfk-lhr | high-traffic-trunk | AA JFK→LHR | should-appear | Y | Y | pass | Present in merged index |
| trunk-qf-syd-lax | high-traffic-trunk | QF SYD→LAX | should-appear | Y | Y | pass | Present in merged index |
| trunk-qr-doh-lhr | high-traffic-trunk | QR DOH→LHR | should-appear | Y | Y | pass | Present in merged index |
| trunk-cx-hkg-syd | high-traffic-trunk | CX HKG→SYD | should-appear | Y | Y | pass | Present in merged index |
| trunk-jl-nrt-lax | high-traffic-trunk | JL NRT→LAX | should-appear | Y | Y | pass | Present in merged index |
| trunk-aa-dfw-lhr | high-traffic-trunk | AA DFW→LHR | should-appear | Y | Y | pass | Present in merged index |
| trunk-ib-mad-gru | high-traffic-trunk | IB MAD→GRU | should-appear | Y | Y | pass | Present in merged index |
| trunk-mh-kul-sin | high-traffic-trunk | MH KUL→SIN | should-appear | Y | Y | pass | Present in merged index |
| trunk-ay-hel-lhr | high-traffic-trunk | AY HEL→LHR | should-appear | Y | Y | pass | Present in merged index |
| affiliate-ba-lhr-man | affiliate-edge | BA LHR→MAN | operating-carrier-needed | Y | Y | na | Route pair index cannot resolve operating carrier — Tier 2 only |
| affiliate-ba-lhr-edi | affiliate-edge | BA LHR→EDI | operating-carrier-needed | Y | Y | na | Route pair index cannot resolve operating carrier — Tier 2 only |
| affiliate-qf-syd-per | affiliate-edge | QF SYD→PER | operating-carrier-needed | Y | Y | na | Route pair index cannot resolve operating carrier — Tier 2 only |
| affiliate-qf-bne-ool | affiliate-edge | QF BNE→OOL | operating-carrier-needed | N | N | na | Route pair index cannot resolve operating carrier — Tier 2 only |
| affiliate-aa-dfw-abi | affiliate-edge | AA DFW→ABI | operating-carrier-needed | Y | Y | na | Route pair index cannot resolve operating carrier — Tier 2 only |
| affiliate-aa-ord-rdu | affiliate-edge | AA ORD→RDU | operating-carrier-needed | Y | Y | na | Route pair index cannot resolve operating carrier — Tier 2 only |
| affiliate-ib-mad-pmi | affiliate-edge | IB MAD→PMI | operating-carrier-needed | Y | Y | na | Route pair index cannot resolve operating carrier — Tier 2 only |
| affiliate-as-sea-pdx | affiliate-edge | AS SEA→PDX | operating-carrier-needed | Y | Y | na | Route pair index cannot resolve operating carrier — Tier 2 only |
| affiliate-jl-hnd-cts | affiliate-edge | JL HND→CTS | operating-carrier-needed | Y | Y | na | Route pair index cannot resolve operating carrier — Tier 2 only |
| affiliate-fj-nan-vli | affiliate-edge | FJ NAN→VLI | operating-carrier-needed | Y | Y | na | Route pair index cannot resolve operating carrier — Tier 2 only |
| newer-at-cmn-jfk | newer-members | AT CMN→JFK | should-appear | Y | Y | pass | Present in merged index |
| newer-at-cmn-lhr | newer-members | AT CMN→LHR | should-appear | Y | Y | pass | Present in merged index |
| newer-wy-mct-lhr | newer-members | WY MCT→LHR | should-appear | Y | Y | pass | Present in merged index |
| newer-wy-mct-bkk | newer-members | WY MCT→BKK | should-appear | Y | Y | pass | Present in merged index |
| newer-nu-oka-hnd | newer-members | NU OKA→HND | should-appear | N | N | fail | Missing from merged index — recall gap |
| newer-nu-isg-hnd | newer-members | NU ISG→HND | should-appear | N | N | fail | Missing from merged index — recall gap |
| newer-at-cmn-doh | newer-members | AT CMN→DOH | should-appear | Y | Y | pass | Present in merged index |
| newer-wy-mct-doh | newer-members | WY MCT→DOH | should-appear | Y | Y | pass | Present in merged index |
| newer-at-cmn-cai | newer-members | AT CMN→CAI | should-appear | Y | Y | pass | Present in merged index |
| newer-wy-mct-del | newer-members | WY MCT→DEL | should-appear | Y | Y | pass | Present in merged index |
| multihop-lhr-per | false-negative-trap | QF LHR→PER | advisory-only | Y | Y | na | Multi-hop advisory — direct index presence optional |
| multihop-jfk-syd | false-negative-trap | QF JFK→SYD | advisory-only | N | N | na | Multi-hop advisory — direct index presence optional |
| multihop-lax-bkk | false-negative-trap | CX LAX→BKK | advisory-only | N | N | na | Multi-hop advisory — direct index presence optional |
| multihop-ord-del | false-negative-trap | QR ORD→DEL | advisory-only | N | N | na | Multi-hop advisory — direct index presence optional |
| multihop-sfo-sin | false-negative-trap | SQ SFO→SIN | advisory-only | N | N | na | Multi-hop advisory — direct index presence optional |
| multihop-mad-nrt | false-negative-trap | IB MAD→NRT | advisory-only | Y | Y | na | Multi-hop advisory — direct index presence optional |
| multihop-akl-lhr | false-negative-trap | QF AKL→LHR | advisory-only | N | N | na | Multi-hop advisory — direct index presence optional |
| multihop-dfw-hkg | false-negative-trap | CX DFW→HKG | advisory-only | Y | Y | na | Multi-hop advisory — direct index presence optional |
| multihop-bos-doh | false-negative-trap | QR BOS→DOH | should-appear | Y | Y | pass | Present in merged index |
| multihop-per-lhr | false-negative-trap | BA PER→LHR | advisory-only | N | N | na | Multi-hop advisory — direct index presence optional |

## Gaps identified

- **newer-nu-oka-hnd**: Missing from merged index — recall gap
- **newer-nu-isg-hnd**: Missing from merged index — recall gap

### Newer-member recall gaps

- NU OKA→HND
- NU ISG→HND

## Method applicability

- **Route index (FlightsFrom weekly)**: Good trunk recall; ended routes need override blocklist when FlightsFrom lags.
- **Operating carrier (affiliate category)**: Not solvable at Tier 1 — requires Method B or user paste.
- **Multi-hop traps**: Expected advisory-only; hub BFS may still miss valid paths.
