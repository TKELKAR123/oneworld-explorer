export interface ScheduleSearchParams {
  from: string;
  to: string;
  date: string;
  carriers?: string[];
}

export interface NormalizedFlight {
  marketingCarrier: string;
  operatingCarrier: string;
  operatingCarrierSource: "api" | "inferred" | "unknown";
  flightNumber: string;
  departure: { point: string; time: string; terminal?: string };
  arrival: { point: string; time: string; terminal?: string };
  stops: Array<{ point: string; arrivalTime?: string; departureTime?: string }>;
  codeshareStatus?: string;
  provider: string;
  fetchedAt: string;
}

export interface ScheduleSearchResult {
  asOf: string;
  flights: NormalizedFlight[];
  scheduleOnly: true;
  warnings?: string[];
}

export interface ScheduleProvider {
  readonly name: string;
  searchRoute(params: ScheduleSearchParams): Promise<NormalizedFlight[]>;
  healthCheck(): Promise<boolean>;
}
