# Kiwi vs OpenFlights benchmark comparison

Generated: 2026-06-19

| Source | Route keys |
|--------|------------|
| OpenFlights merged | 6882 |
| Kiwi fixtures | 0 |

| Outcome | Count |
|---------|-------|
| Both present | 0 |
| Kiwi-only better | 4 |
| OpenFlights-only | 24 |
| Neither | 3 |

| ID | Route | Expected | OF | Kiwi | Winner |
|----|-------|----------|----|------|--------|
| inactive-aa-nrt-jfk | AA NRT→JFK | must-not-appear-active | Y | N | kiwi |
| inactive-jl-nrt-jfk | JL NRT→JFK | must-not-appear-active | Y | N | kiwi |
| inactive-aa-jfk-nrt | AA JFK→NRT | must-not-appear-active | Y | N | kiwi |
| inactive-jl-jfk-nrt | JL JFK→NRT | must-not-appear-active | Y | N | kiwi |
| inactive-aa-dfw-nrt | AA DFW→NRT | verify-dates | Y | N | na |
| inactive-ba-lhr-per | BA LHR→PER | verify-dates | N | N | na |
| inactive-qf-per-lhr | QF PER→LHR | verify-dates | N | N | na |
| inactive-mh-kul-lhr | MH KUL→LHR | verify-dates | Y | N | na |
| inactive-ib-mad-bos | IB MAD→BOS | verify-dates | Y | N | na |
| inactive-rj-amm-jfk | RJ AMM→JFK | verify-dates | Y | N | na |
| seasonal-ib-jfk-mad | IB JFK→MAD | may-appear-verify-dates | Y | N | na |
| seasonal-ay-mad-osl | AY MAD→OSL | may-appear-verify-dates | Y | N | na |
| seasonal-ba-jfk-lhr | BA JFK→LHR | should-appear | Y | N | openflights |
| seasonal-ay-lhr-osl | AY LHR→OSL | may-appear-verify-dates | Y | N | na |
| seasonal-ay-hel-bkk | AY HEL→BKK | may-appear-verify-dates | Y | N | na |
| seasonal-fj-nan-akl | FJ NAN→AKL | should-appear | Y | N | openflights |
| seasonal-cx-hkg-lhr | CX HKG→LHR | should-appear | Y | N | openflights |
| seasonal-jl-hnd-sfo | JL HND→SFO | should-appear | Y | N | openflights |
| seasonal-qr-doh-mle | QR DOH→MLE | should-appear | Y | N | openflights |
| seasonal-as-sea-lhr | BA SEA→LHR | should-appear | Y | N | openflights |
| trunk-ba-lhr-jfk | BA LHR→JFK | should-appear | Y | N | openflights |
| trunk-aa-jfk-lhr | AA JFK→LHR | should-appear | Y | N | openflights |
| trunk-qf-syd-lax | QF SYD→LAX | should-appear | Y | N | openflights |
| trunk-qr-doh-lhr | QR DOH→LHR | should-appear | Y | N | openflights |
| trunk-cx-hkg-syd | CX HKG→SYD | should-appear | Y | N | openflights |
| trunk-jl-nrt-lax | JL NRT→LAX | should-appear | Y | N | openflights |
| trunk-aa-dfw-lhr | AA DFW→LHR | should-appear | Y | N | openflights |
| trunk-ib-mad-gru | IB MAD→GRU | should-appear | Y | N | openflights |
| trunk-mh-kul-sin | MH KUL→SIN | should-appear | Y | N | openflights |
| trunk-ay-hel-lhr | AY HEL→LHR | should-appear | Y | N | openflights |
| affiliate-ba-lhr-man | BA LHR→MAN | operating-carrier-needed | Y | N | na |
| affiliate-ba-lhr-edi | BA LHR→EDI | operating-carrier-needed | Y | N | na |
| affiliate-qf-syd-per | QF SYD→PER | operating-carrier-needed | Y | N | na |
| affiliate-qf-bne-ool | QF BNE→OOL | operating-carrier-needed | N | N | na |
| affiliate-aa-dfw-abi | AA DFW→ABI | operating-carrier-needed | Y | N | na |
| affiliate-aa-ord-rdu | AA ORD→RDU | operating-carrier-needed | Y | N | na |
| affiliate-ib-mad-pmi | IB MAD→PMI | operating-carrier-needed | Y | N | na |
| affiliate-as-sea-pdx | AS SEA→PDX | operating-carrier-needed | Y | N | na |
| affiliate-jl-hnd-cts | JL HND→CTS | operating-carrier-needed | Y | N | na |
| affiliate-fj-nan-vli | FJ NAN→VLI | operating-carrier-needed | Y | N | na |
| newer-at-cmn-jfk | AT CMN→JFK | should-appear | Y | N | openflights |
| newer-at-cmn-lhr | AT CMN→LHR | should-appear | Y | N | openflights |
| newer-wy-mct-lhr | WY MCT→LHR | should-appear | Y | N | openflights |
| newer-wy-mct-bkk | WY MCT→BKK | should-appear | Y | N | openflights |
| newer-nu-oka-hnd | NU OKA→HND | should-appear | N | N | neither |
| newer-nu-isg-hnd | NU ISG→HND | should-appear | Y | N | openflights |
| newer-at-cmn-doh | AT CMN→DOH | should-appear | N | N | neither |
| newer-wy-mct-doh | WY MCT→DOH | should-appear | Y | N | openflights |
| newer-at-cmn-cai | AT CMN→CAI | should-appear | Y | N | openflights |
| newer-wy-mct-del | WY MCT→DEL | should-appear | Y | N | openflights |
| multihop-lhr-per | QF LHR→PER | advisory-only | N | N | na |
| multihop-jfk-syd | QF JFK→SYD | advisory-only | N | N | na |
| multihop-lax-bkk | CX LAX→BKK | advisory-only | N | N | na |
| multihop-ord-del | QR ORD→DEL | advisory-only | N | N | na |
| multihop-sfo-sin | SQ SFO→SIN | advisory-only | N | N | na |
| multihop-mad-nrt | IB MAD→NRT | advisory-only | N | N | na |
| multihop-akl-lhr | QF AKL→LHR | advisory-only | N | N | na |
| multihop-dfw-hkg | CX DFW→HKG | advisory-only | N | N | na |
| multihop-bos-doh | QR BOS→DOH | should-appear | N | N | neither |
| multihop-per-lhr | BA PER→LHR | advisory-only | N | N | na |
