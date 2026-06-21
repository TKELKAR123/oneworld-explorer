export type Continent =
  | "europe-middle-east"
  | "africa"
  | "asia"
  | "south-west-pacific"
  | "north-america"
  | "south-america";

export type TrafficZone = "TC1" | "TC2" | "TC3";
export type SubZone = "europe" | "middle-east";
export type TravelClass = "economy" | "premium-economy" | "business" | "first";
export type Direction = "east" | "west";

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  continent: Continent;
  zone: TrafficZone;
  subZone?: SubZone;
  usState?: string;
  caProvince?: string;
  latitude?: number;
  longitude?: number;
}

export type FareProduct = "DONE3" | "IONE3";

export interface TicketContext {
  purchasedBeforeDeparture?: boolean;
  validatingCarrier?: string;
  saleMarket?: string;
  reservationDate?: string;
  ticketingCompleteDate?: string;
  pnrHasOsiRtw?: boolean;
  /** 3-continent business product; defaults to DONE3 unless sale market qualifies for IONE3 */
  fareProduct?: FareProduct;
}

export interface RouteSegment {
  from: string;
  to: string;
  surface?: boolean;
  bookingClass?: TravelClass;
  /** Reservation booking designator (e.g. L, D, I) per §5(b) */
  rbd?: string;
  marketingCarrier?: string;
  operatingCarrier?: string;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  groundTransport?: boolean;
  scheduleSource?: "aviationstack" | "aerodatabox" | "manual";
  operatingCarrierSource?: "api" | "inferred" | "manual" | "unknown";
}

export type RouteInput = string[] | RouteSegment[];

export interface ValidationIssue {
  code: string;
  severity: "error" | "warning" | "info";
  message: string;
  segmentIndex?: number;
  evidence?: string[];
  pdfRef?: string;
  category?: string;
  naturalLanguage?: string;
}

export type ValidationOutcome = "invalid" | "validWithWarnings" | "valid";

export type RuleKind = "tariff" | "exception" | "advisory";
export type RuleApplicabilityMode = "always" | "whenTriggered";
export type RuleEvaluationApplicability = "active" | "notApplicable";

export type OpenJawType =
  | "within-origin-country"
  | "within-middle-east"
  | "us-canada"
  | "hkg-china"
  | "my-sin"
  | "within-africa"
  | "mv-lk-in";

export interface OriginReturnSummary {
  originIata: string;
  returnIata: string;
  originCountry?: string;
  returnCountry?: string;
  mode: "closedLoop" | "openJaw" | "openJawPending";
  openJawType?: OpenJawType;
  openJawLabel?: string;
  requiresSurface: boolean;
  /** Plain-language hint when return ≠ origin but open jaw is not yet satisfied */
  pendingHint?: string;
}

export interface RuleEvaluation {
  ruleId: string;
  passed: boolean;
  severity: "error" | "warning" | "info";
  category: string;
  pdfRef: string;
  naturalLanguage: string;
  message?: string;
  evidence?: string[];
  segmentIndices?: number[];
  ruleKind?: RuleKind;
  displayGroup?: string;
  applicability?: RuleEvaluationApplicability;
}

export interface ItinerarySuggestion {
  kind: "insert_stop" | "mark_surface" | "connect_chain";
  from: string;
  to: string;
  reason: string;
  legIndex?: number;
}

export interface StopListInput {
  stops: string[];
  legTypes?: ("flight" | "surface")[];
}

export type ValidationMode = "geometry" | "scheduleComplete";

export type StopIntent = "stopover" | "connection" | "unknown";

export type LegScheduleStatus =
  | "notSearched"
  | "searching"
  | "attached"
  | "partial"
  | "lookupFailed"
  | "noFlights"
  | "surface";

export interface AttachedFlight {
  id: string;
  legIndex: number;
  marketingCarrier: string;
  operatingCarrier: string;
  operatingCarrierSource: "api" | "inferred" | "manual" | "unknown";
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  rbd?: string;
  bookingClass?: TravelClass;
  codeshareStatus?: string;
  provider: "aviationstack" | "aerodatabox" | "manual";
  providerFlightKey?: string;
  technicalStops?: Array<{
    point: string;
    arrivalTime?: string;
    departureTime?: string;
  }>;
}

export interface LegScheduleState {
  legIndex: number;
  status: LegScheduleStatus;
  searchDate?: string;
  attachedFlight?: AttachedFlight;
  errorMessage?: string;
  warningMessage?: string;
}

export interface ScheduleValidationSummary {
  mode: "geometry" | "scheduleComplete" | "partialSchedule";
  legs: LegScheduleState[];
  bookingRulesActive: boolean;
  missingForBookingRules?: string[];
}

export interface ValidateRequestInput {
  stops?: string[];
  legTypes?: ("flight" | "surface")[];
  segments?: RouteSegment[];
  travelClass?: TravelClass;
  ticket?: TicketContext;
  validationMode?: ValidationMode;
  legScheduleStates?: LegScheduleState[];
  /** Per-stop intent (index aligns with stops[]); used when schedule times absent */
  stopIntents?: StopIntent[];
  rulesVersion?: string;
  /** Force building vs ticket-ready evaluation (defaults to inferred phase). */
  validationPhase?: ValidationPhase;
  /** Client hint alias for validationPhase (API). */
  clientPhase?: ValidationPhase;
}

export interface RouteAnalysis {
  segments: Array<{
    index: number;
    from: Airport;
    to: Airport;
    surface: boolean;
    fromContinent: Continent;
    toContinent: Continent;
    crossesAtlantic: boolean;
    crossesPacific: boolean;
    zoneTransition: { from: TrafficZone; to: TrafficZone } | null;
  }>;
  continentsVisited: Continent[];
  continentCount: number;
  suggestedFareBasis: string | null;
  direction: Direction | null;
  flightSegmentsByContinent: Record<Continent, number>;
  totalSegments: number;
  crossesAtlantic: boolean;
  crossesPacific: boolean;
  originReturn: OriginReturnSummary;
}

export type ValidationPhase = "building" | "ticketReady";

export interface ValidationResult {
  valid: boolean;
  outcome: ValidationOutcome;
  blockingIssueCount: number;
  warningCount: number;
  rulesVersion: string;
  issues: ValidationIssue[];
  ruleEvaluations: RuleEvaluation[];
  suggestions?: ItinerarySuggestion[];
  analysis: RouteAnalysis | null;
  scheduleSummary?: ScheduleValidationSummary;
  validationPhase?: ValidationPhase;
  guidanceIssues?: ValidationIssue[];
  suppressedIssueCodes?: string[];
}

export interface ValidateOptions {
  travelClass?: TravelClass;
  originContinent?: Continent;
  ticket?: TicketContext;
  validationMode?: ValidationMode;
  scheduleComplete?: boolean;
  stopIntents?: StopIntent[];
  validationPhase?: ValidationPhase;
  clientPhase?: ValidationPhase;
}

export interface ParsedItinerary {
  segments: RouteSegment[];
  points: Airport[];
}

export interface EvaluationContext {
  itinerary: ParsedItinerary;
  options: ValidateOptions;
  analysis: RouteAnalysis;
  ticket?: TicketContext;
}
