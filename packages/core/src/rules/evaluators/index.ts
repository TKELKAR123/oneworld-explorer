import type { RuleEvaluator } from "./types.js";
import { evaluateR3015_0_fare_class } from "./R3015-0-fare-class.js";
import { evaluateR3015_0_continent_count } from "./R3015-0-continent-count.js";
import { evaluateR3015_0_three_continent_origin } from "./R3015-0-three-continent-origin.js";
import {
  evaluateR3015_0_fare_basis,
  evaluateR3015_0_swp_eu_via_asia,
} from "./R3015-0-fare-basis.js";
import {
  evaluateR3015_0_asia_countries,
  evaluateR3015_0_continent_def,
  evaluateR3015_0_eu_me_zones,
  evaluateR3015_0_na_includes,
  evaluateR3015_0_tc_def,
} from "./R3015-0-geography.js";
import {
  evaluateR3015_0_IONE3_markets,
  evaluateR3015_0_purchase,
} from "./R3015-0-ticketing-meta.js";
import { evaluateR3015_4a } from "./R3015-4a.js";
import { evaluateR3015_4b_direction } from "./R3015-4b-direction.js";
import { evaluateR3015_4b_hawaii } from "./R3015-4b-hawaii.js";
import { evaluateR3015_4c_origin } from "./R3015-4c-origin.js";
import {
  evaluateR3015_4c_open_jaw_a,
  evaluateR3015_4c_open_jaw_b,
  evaluateR3015_4c_open_jaw_c,
  evaluateR3015_4c_open_jaw_d,
  evaluateR3015_4c_open_jaw_e,
  evaluateR3015_4c_open_jaw_f,
  evaluateR3015_4c_open_jaw_g,
} from "./R3015-4c-open-jaw.js";
import { evaluateR3015_4d_no_via_origin } from "./R3015-4d-no-via-origin.js";
import {
  evaluateR3015_4e_1_na,
  evaluateR3015_4e_2_asia,
  evaluateR3015_4e_3_africa_eu,
  evaluateR3015_4e_intercon,
} from "./R3015-4e-intercon.js";
import {
  evaluateR3015_4f_origin_intl,
  evaluateR3015_4f_us_ca_domestic,
  evaluateR3015_4f_usa_exception,
} from "./R3015-4f-origin-intl.js";
import {
  evaluateR3015_4g_surface,
  evaluateR3015_4g_swp_transoceanic,
} from "./R3015-4g-surface.js";
import {
  evaluateR3015_4h_continent_limits,
  evaluateR3015_4h_segment_count,
} from "./R3015-4h-segments.js";
import { evaluateR3015_4i_duplicate_sector } from "./R3015-4i-duplicate-sector.js";
import {
  evaluateR3015_4k_alaska,
  evaluateR3015_4k_us_transcon,
  evaluateR3015_4l_australia,
} from "./R3015-4k-transcon.js";
import { evaluateR3015_itinerary_continuity } from "./R3015-itinerary-continuity.js";
import { evaluateR3015_4_carriers } from "./R3015-4-carriers.js";
import {
  evaluateR3015_4_affiliates,
  evaluateR3015_4_no_ground_transport,
  evaluateR3015_4j_codeshare,
  evaluateR3015_4j_jq_qq,
} from "./R3015-4j-carrier-rules.js";
import {
  evaluateR3015_5_reservations,
  evaluateR3015_5b_booking,
} from "./R3015-5-ticketing.js";
import {
  evaluateR3015_6_min_stay,
  evaluateR3015_7_max_stay,
  evaluateR3015_8_stopovers,
  evaluateR3015_9_transfers,
} from "./R3015-6-9-stay.js";
import {
  evaluateR3015_15_cuba,
  evaluateR3015_15_stock,
  evaluateR3015_15_stock_jq,
} from "./R3015-15-sales.js";

export const EVALUATOR_MAP: Record<string, RuleEvaluator> = {
  "R3015-0-purchase": evaluateR3015_0_purchase,
  "R3015-0-fare-class": evaluateR3015_0_fare_class,
  "R3015-0-continent-count": evaluateR3015_0_continent_count,
  "R3015-0-three-continent-origin": evaluateR3015_0_three_continent_origin,
  "R3015-itinerary-continuity": evaluateR3015_itinerary_continuity,
  "R3015-0-fare-basis": evaluateR3015_0_fare_basis,
  "R3015-0-IONE3-markets": evaluateR3015_0_IONE3_markets,
  "R3015-0-swp-eu-via-asia": evaluateR3015_0_swp_eu_via_asia,
  "R3015-0-tc-def": evaluateR3015_0_tc_def,
  "R3015-0-continent-def": evaluateR3015_0_continent_def,
  "R3015-0-eu-me-zones": evaluateR3015_0_eu_me_zones,
  "R3015-0-asia-countries": evaluateR3015_0_asia_countries,
  "R3015-0-na-includes": evaluateR3015_0_na_includes,
  "R3015-4-carriers": evaluateR3015_4_carriers,
  "R3015-4a": evaluateR3015_4a,
  "R3015-4b-direction": evaluateR3015_4b_direction,
  "R3015-4b-hawaii": evaluateR3015_4b_hawaii,
  "R3015-4c-origin": evaluateR3015_4c_origin,
  "R3015-4c-open-jaw-a": evaluateR3015_4c_open_jaw_a,
  "R3015-4c-open-jaw-b": evaluateR3015_4c_open_jaw_b,
  "R3015-4c-open-jaw-c": evaluateR3015_4c_open_jaw_c,
  "R3015-4c-open-jaw-d": evaluateR3015_4c_open_jaw_d,
  "R3015-4c-open-jaw-e": evaluateR3015_4c_open_jaw_e,
  "R3015-4c-open-jaw-f": evaluateR3015_4c_open_jaw_f,
  "R3015-4c-open-jaw-g": evaluateR3015_4c_open_jaw_g,
  "R3015-4d-no-via-origin": evaluateR3015_4d_no_via_origin,
  "R3015-4e-intercon": evaluateR3015_4e_intercon,
  "R3015-4e-1-na": evaluateR3015_4e_1_na,
  "R3015-4e-2-asia": evaluateR3015_4e_2_asia,
  "R3015-4e-3-africa-eu": evaluateR3015_4e_3_africa_eu,
  "R3015-4f-origin-intl": evaluateR3015_4f_origin_intl,
  "R3015-4f-usa-exception": evaluateR3015_4f_usa_exception,
  "R3015-4f-us-ca-domestic": evaluateR3015_4f_us_ca_domestic,
  "R3015-4g-surface": evaluateR3015_4g_surface,
  "R3015-4g-swp-transoceanic": evaluateR3015_4g_swp_transoceanic,
  "R3015-4h-segment-count": evaluateR3015_4h_segment_count,
  "R3015-4h-continent-limits": evaluateR3015_4h_continent_limits,
  "R3015-4i-duplicate-sector": evaluateR3015_4i_duplicate_sector,
  "R3015-4j-codeshare": evaluateR3015_4j_codeshare,
  "R3015-4j-jq-qq": evaluateR3015_4j_jq_qq,
  "R3015-4-affiliates": evaluateR3015_4_affiliates,
  "R3015-4-no-ground-transport": evaluateR3015_4_no_ground_transport,
  "R3015-4k-us-transcon": evaluateR3015_4k_us_transcon,
  "R3015-4k-alaska": evaluateR3015_4k_alaska,
  "R3015-4l-australia": evaluateR3015_4l_australia,
  "R3015-5-reservations": evaluateR3015_5_reservations,
  "R3015-5b-booking": evaluateR3015_5b_booking,
  "R3015-6-min-stay": evaluateR3015_6_min_stay,
  "R3015-7-max-stay": evaluateR3015_7_max_stay,
  "R3015-8-stopovers": evaluateR3015_8_stopovers,
  "R3015-9-transfers": evaluateR3015_9_transfers,
  "R3015-15-stock": evaluateR3015_15_stock,
  "R3015-15-stock-jq": evaluateR3015_15_stock_jq,
  "R3015-15-cuba": evaluateR3015_15_cuba,
};

export const V01_EVALUATOR_ORDER = Object.keys(EVALUATOR_MAP);
