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
  latitude?: number;
  longitude?: number;
}

export interface RouteSegment {
  from: string;
  to: string;
  surface?: boolean;
  bookingClass?: TravelClass;
  marketingCarrier?: string;
  operatingCarrier?: string;
}

export type RouteInput = string[] | RouteSegment[];

export interface ValidationIssue {
  code: string;
  severity: "error" | "warning";
  message: string;
  segmentIndex?: number;
  evidence?: string[];
  pdfRef?: string;
  category?: string;
  naturalLanguage?: string;
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
}

export interface ValidationResult {
  valid: boolean;
  rulesVersion: string;
  issues: ValidationIssue[];
  analysis: RouteAnalysis | null;
}

export interface ValidateOptions {
  travelClass?: TravelClass;
  originContinent?: Continent;
}

export interface ParsedItinerary {
  segments: RouteSegment[];
  points: Airport[];
}

export interface EvaluationContext {
  itinerary: ParsedItinerary;
  options: ValidateOptions;
  analysis: RouteAnalysis;
}
