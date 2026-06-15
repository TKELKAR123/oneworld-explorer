import type { NormalizedFlight, ScheduleProvider, ScheduleSearchParams } from "./provider.js";

/** v0.2 stub — Aviationstack primary adapter (not wired). */
export class AviationstackProvider implements ScheduleProvider {
  readonly name = "aviationstack";

  async searchRoute(_params: ScheduleSearchParams): Promise<NormalizedFlight[]> {
    return [];
  }

  async healthCheck(): Promise<boolean> {
    return false;
  }
}

export function createAviationstackProvider(_apiKey?: string): AviationstackProvider {
  return new AviationstackProvider();
}
