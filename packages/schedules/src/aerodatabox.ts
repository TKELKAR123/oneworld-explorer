import type { NormalizedFlight, ScheduleProvider, ScheduleSearchParams } from "./provider.js";

/** v0.2 stub — AeroDataBox secondary adapter for codeshare metadata. */
export class AeroDataBoxProvider implements ScheduleProvider {
  readonly name = "aerodatabox";

  async searchRoute(_params: ScheduleSearchParams): Promise<NormalizedFlight[]> {
    return [];
  }

  async healthCheck(): Promise<boolean> {
    return false;
  }
}

export function createAeroDataBoxProvider(_apiKey?: string): AeroDataBoxProvider {
  return new AeroDataBoxProvider();
}
